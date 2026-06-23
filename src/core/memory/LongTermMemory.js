import { databaseService } from '../../data/db/LocalDatabase';
import { eventBus } from '../events/EventBus';
export class LongTermMemory {
    facts = [];
    // Diagnostics metrics
    duplicateBlockedCount = 0;
    lastSavedFact = null;
    lastUsedFact = null;
    status = 'idle';
    constructor() {
        this.initialize();
        // Subscribe to database changes to keep in-memory cache in sync
        eventBus.subscribe('MemorySaved', (memory) => this.handleExternalSave(memory));
        eventBus.subscribe('MemoryUpdated', (memory) => this.handleExternalUpdate(memory));
        eventBus.subscribe('MemoryDeleted', (payload) => this.handleExternalDelete(payload));
    }
    async initialize() {
        this.status = 'initializing';
        try {
            const stored = await databaseService.getMemories();
            // Safe Category Mapping for legacy items
            this.facts = stored.map(item => this.mapLegacyMemoryItem(item));
            // Save mapped items back to local storage if any was mapped
            let wasMapped = false;
            for (let i = 0; i < stored.length; i++) {
                if (stored[i].category !== this.facts[i].category) {
                    wasMapped = true;
                    await databaseService.saveMemory(this.facts[i]);
                }
            }
            if (wasMapped) {
                console.log('[LongTermMemory] Successfully migrated legacy memory categories in DB.');
            }
            this.status = 'ready';
            console.log(`[LongTermMemory] Loaded ${this.facts.length} memory facts.`);
        }
        catch (e) {
            console.error('[LongTermMemory] Failed to load memories from Database:', e);
            this.status = 'idle';
        }
    }
    /**
     * Safe mapping from legacy categories to the new 10 categories
     */
    mapLegacyMemoryItem(item) {
        const validCategories = new Set([
            'identity', 'preference', 'health', 'sport', 'work',
            'relationship', 'routine', 'goal', 'location', 'custom'
        ]);
        let category = item.category;
        if (!validCategories.has(category)) {
            // Map legacy categories
            if (category === 'name') {
                category = 'identity';
            }
            else if (category === 'job' || category === 'projects' || category === 'ongoingTasks') {
                category = 'work';
            }
            else if (category === 'habits') {
                category = 'routine';
            }
            else if (category === 'preferences') {
                category = 'preference';
            }
            else if (category === 'importantNotes') {
                category = 'custom';
            }
            else if (category === 'general') {
                category = 'preference';
            }
            else {
                category = 'custom';
            }
        }
        return {
            id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            category: category,
            content: item.content || '',
            confidence: typeof item.confidence === 'number' ? item.confidence : 1.0,
            source: item.source || 'manual',
            createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
            updatedAt: item.updatedAt || item.timestamp || new Date().toISOString(),
            lastUsedAt: item.lastUsedAt || item.timestamp || new Date().toISOString(),
            importance: typeof item.importance === 'number' ? item.importance : 3
        };
    }
    getFacts() {
        return this.facts;
    }
    getStatus() {
        return this.status;
    }
    getDiagnostics() {
        return {
            totalCount: this.facts.length,
            lastSaved: this.lastSavedFact ? this.lastSavedFact.content : 'Yok',
            lastUsed: this.lastUsedFact ? this.lastUsedFact.content : 'Yok',
            duplicateBlockedCount: this.duplicateBlockedCount,
            status: this.status
        };
    }
    /**
     * Checks similarity between two strings to prevent duplicates.
     * Returns a score between 0.0 and 1.0.
     */
    getSimilarityScore(str1, str2) {
        const clean = (s) => s.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
            .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u')
            .trim();
        const tokens1 = clean(str1).split(/\s+/).filter(t => t.length > 1);
        const tokens2 = clean(str2).split(/\s+/).filter(t => t.length > 1);
        if (tokens1.length === 0 || tokens2.length === 0)
            return 0;
        // Opposing polarities check
        const hasNegation1 = tokens1.some(t => t.includes('degil') || t.includes('yok') || t.endsWith('me') || t.endsWith('ma') || t.includes('siz') || t.includes('suz'));
        const hasNegation2 = tokens2.some(t => t.includes('degil') || t.includes('yok') || t.endsWith('me') || t.endsWith('ma') || t.includes('siz') || t.includes('suz'));
        if (hasNegation1 !== hasNegation2) {
            return 0; // A positive and a negative statement are not duplicates
        }
        // Convert to stems (first 4 characters of each word)
        const stems1 = tokens1.map(t => t.substring(0, 4));
        const stems2 = tokens2.map(t => t.substring(0, 4));
        const set1 = new Set(stems1);
        const set2 = new Set(stems2);
        let intersection = 0;
        for (const stem of set1) {
            if (set2.has(stem)) {
                intersection++;
            }
        }
        // Overlap coefficient
        return intersection / Math.min(set1.size, set2.size);
    }
    /**
     * Adds a new fact with duplicate checking.
     * If a duplicate is found, it updates the existing one.
     */
    async addFact(content, category = 'custom', confidence = 1.0, source = 'explicit', importance = 3) {
        // Check for similarity
        const existingSimilar = this.facts.find(f => this.getSimilarityScore(f.content, content) >= 0.7);
        if (existingSimilar) {
            // If it is identical in text and category, block it as duplicate
            if (existingSimilar.content.toLowerCase().trim() === content.toLowerCase().trim() && existingSimilar.category === category) {
                this.duplicateBlockedCount++;
                return {
                    success: true,
                    action: 'duplicate_blocked',
                    memory: existingSimilar
                };
            }
            // Otherwise, update existing memory item with new content/updated time
            const updatedItem = {
                ...existingSimilar,
                category,
                content,
                confidence: Math.max(existingSimilar.confidence || 0.8, confidence),
                source,
                updatedAt: new Date().toISOString(),
                importance: Math.max(existingSimilar.importance || 3, importance)
            };
            await databaseService.saveMemory(updatedItem);
            // Update local facts cache
            this.facts = this.facts.map(f => f.id === updatedItem.id ? updatedItem : f);
            this.lastSavedFact = updatedItem;
            eventBus.publish('MemoryUpdated', updatedItem);
            return {
                success: true,
                action: 'updated',
                memory: updatedItem
            };
        }
        // Safe new memory item
        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            category,
            content: content.trim(),
            confidence,
            source,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
            importance
        };
        await databaseService.saveMemory(newItem);
        this.facts.push(newItem);
        this.lastSavedFact = newItem;
        eventBus.publish('MemorySaved', newItem);
        return {
            success: true,
            action: 'saved',
            memory: newItem
        };
    }
    /**
     * Deletes a memory item.
     */
    async deleteFact(id) {
        const exists = this.facts.some(f => f.id === id);
        if (!exists)
            return false;
        await databaseService.deleteMemory(id);
        this.facts = this.facts.filter(f => f.id !== id);
        eventBus.publish('MemoryDeleted', { id });
        return true;
    }
    /**
     * Search for relevant facts based on user query
     */
    search(query) {
        const cleanQuery = query.toLowerCase();
        // Sort memories by relevance score and importance
        const scored = this.facts.map(fact => {
            let score = 0;
            const sim = this.getSimilarityScore(fact.content, query);
            // Exact substring match check
            if (fact.content.toLowerCase().includes(cleanQuery) || cleanQuery.includes(fact.content.toLowerCase())) {
                score += 0.8;
            }
            score += sim * 0.7;
            // Category boost if the query contains the category name or synonyms
            const catSynonyms = {
                identity: ['ad', 'isim', 'kimlik', 'kimim'],
                preference: ['sever', 'tercih', 'beğen', 'hoslan', 'hırs'],
                health: ['sağlık', 'ilaç', 'hastalık', 'doktor', 'agri'],
                sport: ['spor', 'egzersiz', 'antreman', 'badminton', 'koşu', 'yüzme'],
                work: ['iş', 'çalışma', 'proje', 'meslek', 'kod', 'görev'],
                relationship: ['arkadaş', 'görüştü', 'eşi', 'anne', 'baba', 'kardeş'],
                routine: ['rutin', 'alışkanlık', 'her gün', 'her sabah'],
                goal: ['hedef', 'amaç', 'plan', 'düşmek', 'ulaşmak'],
                location: ['adres', 'ev', 'ofis', 'konum', 'yer'],
                custom: ['not', 'bilgi']
            };
            const synonyms = catSynonyms[fact.category] || [];
            if (synonyms.some(s => cleanQuery.includes(s))) {
                score += 0.3;
            }
            return { fact, score };
        });
        // Filter to those with meaningful score
        const results = scored
            .filter(s => s.score > 0.15)
            .sort((a, b) => b.score - a.score || (b.fact.importance || 3) - (a.fact.importance || 3))
            .map(s => s.fact);
        return results;
    }
    /**
     * Record when a fact was retrieved
     */
    recordUsage(fact) {
        this.lastUsedFact = fact;
        fact.lastUsedAt = new Date().toISOString();
        databaseService.saveMemory(fact);
    }
    // External event handlers to keep sync in multi-window environments
    handleExternalSave(memory) {
        if (!memory || !memory.id)
            return;
        const mapped = this.mapLegacyMemoryItem(memory);
        if (!this.facts.some(f => f.id === mapped.id)) {
            this.facts.push(mapped);
        }
    }
    handleExternalUpdate(memory) {
        if (!memory || !memory.id)
            return;
        const mapped = this.mapLegacyMemoryItem(memory);
        this.facts = this.facts.map(f => f.id === mapped.id ? mapped : f);
    }
    handleExternalDelete(payload) {
        const id = typeof payload === 'string' ? payload : (payload.id || payload.itemId);
        if (id) {
            this.facts = this.facts.filter(f => f.id !== id);
        }
    }
}
