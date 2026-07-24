"""
Voice System Speech-to-Text Pipeline powered by faster-whisper

This file provides real-time local Speech-to-Text (STT) transcription using the
faster-whisper engine. It saves incoming audio payloads to temporary files, runs
inference via cached WhisperModel instances, and returns transcribed text directly
to the frontend log editor.
"""

import os
import tempfile
import logging

logger = logging.getLogger(__name__)

# Global model cache to avoid re-loading weights on every audio request
_whisper_model = None

def get_whisper_model():
    """
    Lazy-loads and caches the faster-whisper model.
    Model size, device, and compute_type can be configured via environment variables.
    """
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            
            # Model size options: "tiny", "base", "small", "medium", "large-v3"
            # "base" provides excellent CPU speed and accurate transcription
            model_size = os.getenv("WHISPER_MODEL_SIZE", "base")
            device = os.getenv("WHISPER_DEVICE", "cpu")
            compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
            
            logger.info(f"Loading faster-whisper model ({model_size}) on {device}...")
            _whisper_model = WhisperModel(model_size, device=device, compute_type=compute_type)
        except Exception as e:
            logger.warning(f"Could not load faster-whisper: {e}")
            _whisper_model = False  # Mark as failed to prevent repeated import attempts
            
    return _whisper_model if _whisper_model is not False else None


def process_voice_audio_placeholder(audio_file):
    """
    Processes an uploaded audio file and transcribes speech to text using faster-whisper.
    Falls back gracefully to placeholder notice if faster-whisper is not available or errors out.
    
    Args:
        audio_file: Uploaded file object from Django request.FILES
        
    Returns:
        dict: {
            'transcription': str,
            'detected_hours': float,
            'detected_achievement': str,
            'is_placeholder': bool,
            'status': str
        }
    """
    filename = getattr(audio_file, 'name', 'audio_recording.wav')
    ext = os.path.splitext(filename)[1] or '.wav'

    tmp_path = None
    try:
        # Save uploaded in-memory audio chunk to a temporary file on disk
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        model = get_whisper_model()
        if model is not None:
            segments, info = model.transcribe(tmp_path, beam_size=5)
            transcription = " ".join([segment.text for segment in segments]).strip()
            
            if not transcription:
                transcription = "[No spoken text detected in audio clip]"

            return {
                'transcription': transcription,
                'detected_hours': 1.0,
                'detected_achievement': f'Transcribed via faster-whisper ({info.language.upper()} - {info.language_probability:.0%} confidence)',
                'is_placeholder': False,
                'status': 'success',
                'language': info.language,
                'duration_seconds': round(info.duration, 2)
            }
    except Exception as e:
        logger.error(f"Error during faster-whisper transcription: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    # Fallback response if faster-whisper model fails to load
    return {
        'transcription': (
            f"[VOICE PIPELINE NOTICE] Audio file '{filename}' received. "
            "faster-whisper engine is initializing or ffmpeg is required on system PATH."
        ),
        'detected_hours': 1.0,
        'detected_achievement': 'Audio clip saved.',
        'is_placeholder': True,
        'status': 'fallback'
    }
