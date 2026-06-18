import 'package:flutter_tts/flutter_tts.dart';

enum MoniVoiceProfile { selin, derin, can, murat }

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  final FlutterTts _flutterTts = FlutterTts();
  List<dynamic> _availableVoices = [];
  bool _isInitialized = false;

  factory VoiceService() {
    return _instance;
  }

  VoiceService._internal() {
    _initTts();
  }

  Future<void> _initTts() async {
    if (_isInitialized) return;
    try {
      await _flutterTts.setLanguage("tr-TR");
      var voices = await _flutterTts.getVoices;
      if (voices != null) {
        _availableVoices = List.from(voices)
            .where((v) => v["locale"].toString().startsWith("tr"))
            .toList();
        _isInitialized = true;
      }
    } catch (e) {
      print("MONI TTS Error initializing voices: $e");
    }
  }

  Future<List<dynamic>> getTrVoices() async {
    await _initTts();
    return _availableVoices;
  }

  Future<void> speak(String text, MoniVoiceProfile profile) async {
    await _flutterTts.stop();
    await _initTts();

    // Group available system voices into gender metadata arrays
    var femaleVoices = _availableVoices.where((v) {
      String name = v["name"].toString().toLowerCase();
      return name.contains("dilara") ||
          name.contains("yelda") ||
          name.contains("female") ||
          name.contains("google") ||
          name.contains("seda") ||
          name.contains("sibel");
    }).toList();

    var maleVoices = _availableVoices.where((v) {
      String name = v["name"].toString().toLowerCase();
      return name.contains("tolga") ||
          name.contains("cem") ||
          name.contains("male") ||
          name.contains("can") ||
          name.contains("hakan");
    }).toList();

    Map<String, dynamic>? targetVoice;
    double pitch = 1.0;
    double rate = 1.0;

    switch (profile) {
      case MoniVoiceProfile.selin: // Corporate, serious female
        targetVoice = _availableVoices.firstWhere(
          (v) => v["name"].toString().toLowerCase().contains("dilara"),
          orElse: () => femaleVoices.isNotEmpty ? femaleVoices.first : null,
        );
        pitch = 1.05;
        rate = 1.0;
        break;
      case MoniVoiceProfile.derin: // Natural, warm female
        targetVoice = _availableVoices.firstWhere(
          (v) => v["name"].toString().toLowerCase().contains("google"),
          orElse: () => femaleVoices.length > 1 ? femaleVoices[1] : (femaleVoices.isNotEmpty ? femaleVoices.first : null),
        );
        pitch = 1.25;
        rate = 0.95;
        break;
      case MoniVoiceProfile.can: // Energetic male
        targetVoice = maleVoices.isNotEmpty ? maleVoices.first : null;
        pitch = 1.05;
        rate = 1.05;
        break;
      case MoniVoiceProfile.murat: // Deep protocol male
        targetVoice = maleVoices.length > 1 ? maleVoices[1] : (maleVoices.isNotEmpty ? maleVoices.first : null);
        pitch = 0.8;
        rate = 0.9;
        break;
    }

    bool hasFemaleVoice = femaleVoices.isNotEmpty;
    bool hasMaleVoice = maleVoices.isNotEmpty;

    // Apply gender fallbacks if native voice options are limited
    if (targetVoice != null) {
      String voiceName = targetVoice["name"].toString().toLowerCase();
      bool isActuallyMale = voiceName.contains("tolga") || voiceName.contains("male") || voiceName.contains("cem");
      bool isActuallyFemale = voiceName.contains("dilara") || voiceName.contains("female") || voiceName.contains("google") || voiceName.contains("yelda");

      // Shift male voice to female frequencies
      if ((profile == MoniVoiceProfile.selin || profile == MoniVoiceProfile.derin) && (!hasFemaleVoice || isActuallyMale)) {
        pitch = profile == MoniVoiceProfile.selin ? 1.55 : 1.75;
        rate = profile == MoniVoiceProfile.selin ? 1.0 : 0.95;
      }

      // Shift female voice to male frequencies
      if ((profile == MoniVoiceProfile.can || profile == MoniVoiceProfile.murat) && (!hasMaleVoice || isActuallyFemale)) {
        pitch = profile == MoniVoiceProfile.can ? 0.65 : 0.52;
        rate = profile == MoniVoiceProfile.can ? 1.05 : 0.90;
      }

      await _flutterTts.setVoice(Map<String, String>.from(targetVoice));
    } else {
      // Direct pitch-shifting on system default Turkish voice
      if (profile == MoniVoiceProfile.selin || profile == MoniVoiceProfile.derin) {
        pitch = profile == MoniVoiceProfile.selin ? 1.55 : 1.75;
      } else {
        pitch = profile == MoniVoiceProfile.can ? 0.65 : 0.52;
      }
    }

    await _flutterTts.setPitch(pitch);
    await _flutterTts.setSpeechRate(rate);
    await _flutterTts.speak(text);
  }
}
