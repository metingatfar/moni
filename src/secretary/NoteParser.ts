export interface ParsedNote {
  title: string;
  content: string;
}

export class NoteParser {
  /**
   * Parses a note command from Turkish natural language.
   */
  public static parse(text: string): ParsedNote {
    let content = text;

    // Clean trigger prefix
    const triggers = [
      'not al:', 'not al', 'not ekle:', 'not ekle', 'not et:', 'not et',
      'not yaz:', 'not yaz', 'nota ekle:', 'nota ekle', 'not defterine kaydet'
    ];

    for (const trigger of triggers) {
      if (content.toLowerCase().startsWith(trigger)) {
        content = content.slice(trigger.length).trim();
        break;
      }
    }

    // Secondary cleanup of start punctuation
    content = content.replace(/^[:\-,\s]+/, '').trim();

    if (!content) {
      content = 'Boş Not';
    }

    // Generate a title based on the first few words of the content
    const words = content.split(/\s+/);
    let title = words.slice(0, 5).join(' ');
    
    if (title.length > 30) {
      title = title.slice(0, 27) + '...';
    }

    if (!title) {
      title = 'Yeni Not';
    }

    return {
      title,
      content
    };
  }
}
