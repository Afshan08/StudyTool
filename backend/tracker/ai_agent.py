"""
AI Analysis Pipeline powered by Ollama (local LLM)

This module calls the local Ollama API at http://localhost:11434 to evaluate
project progress, detect blindspots, and recommend actionable efficiency tips.

Ollama must be running locally: `ollama serve`
Default model: llama3 (change OLLAMA_MODEL env var to use another model)
"""

import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def _call_ollama(prompt: str) -> str:
    """
    Makes a blocking HTTP POST to the local Ollama /api/generate endpoint.
    Returns the complete response text.
    """
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=300) as response:
        raw = response.read().decode("utf-8")
        outer = json.loads(raw)
        # Ollama wraps the model output in {"response": "...", ...}
        return outer.get("response", raw)


def run_project_ai_audit(project, logs):
    """
    Executes an AI audit for a project using the local Ollama LLM.

    Args:
        project: Project model instance
        logs: QuerySet or list of TextDetail model instances

    Returns:
        dict with keys:
            - summary_text (str)
            - blindspots_detected (str)
            - goal_completion_progress (int: 0-100)
            - actionable_tips (str)
    """
    logs_formatted = []
    total_hours = 0.0
    for log in logs:
        hours = float(log.hours_worked)
        total_hours += hours
        logs_formatted.append(
            f"- Date: {log.created_at.strftime('%Y-%m-%d')}, Hours: {hours}h\n"
            f"  Log: {log.log_text}\n"
            f"  Achievement: {log.achievement or 'N/A'}"
        )

    logs_summary_input = "\n".join(logs_formatted) if logs_formatted else "No daily logs recorded yet."

    prompt = f"""You are an expert AI Project Manager and Strategy Auditor.

Project Name: {project.name}
SMART Goal (Target & Definition of Done):
"{project.smart_goal}"

Total Logged Hours: {total_hours}h
Recent Activity Logs:
{logs_summary_input}

Analyze the logs against the SMART Goal and respond ONLY with a valid JSON object (no markdown, no explanation outside the JSON) with these exact keys:
{{
  "summary_text": "2-3 sentence high-level summary of work accomplished and current trajectory",
  "blindspots_detected": "Key strategic blindspots, risks, or unaddressed bottlenecks identified from the logs",
  "goal_completion_progress": 42,
  "actionable_tips": "2-3 concrete, high-impact recommendations to improve efficiency and reach completion faster"
}}

goal_completion_progress must be an integer between 0 and 100.
"""

    try:
        raw_response = _call_ollama(prompt)
        # Try to parse JSON from the response
        # Ollama may or may not wrap it; try direct parse first
        try:
            parsed = json.loads(raw_response)
        except json.JSONDecodeError:
            # Try to extract the first JSON block from the text
            import re
            match = re.search(r'\{[\s\S]*\}', raw_response)
            if match:
                parsed = json.loads(match.group())
            else:
                raise ValueError(f"No valid JSON found in Ollama response: {raw_response[:300]}")

        return {
            "summary_text": parsed.get("summary_text", "Audit complete."),
            "blindspots_detected": parsed.get("blindspots_detected", "No critical blindspots detected."),
            "goal_completion_progress": int(parsed.get("goal_completion_progress", 0)),
            "actionable_tips": parsed.get("actionable_tips", "Maintain current momentum.")
        }

    except Exception as e:
        logger.warning(f"Ollama AI audit failed ({e}). Using intelligent fallback generator.")

    # Fallback when Ollama is unavailable
    num_logs = len(list(logs))
    calculated_progress = min(95, max(5, num_logs * 20 + int(total_hours * 4)))

    return {
        "summary_text": (
            f"Project '{project.name}' has accumulated {total_hours:.1f} hours across {num_logs} log entries. "
            f"Working towards: '{project.smart_goal[:80]}...'"
        ),
        "blindspots_detected": (
            "Ollama LLM is currently unavailable (ensure `ollama serve` is running and model is pulled).\n"
            "This is an auto-generated fallback audit."
        ) if num_logs > 0 else "No logs recorded yet. Add daily entries to enable deep blindspot detection.",
        "goal_completion_progress": calculated_progress if num_logs > 0 else 5,
        "actionable_tips": (
            "• Break remaining SMART Goal targets into sub-tasks of <= 2 hours.\n"
            "• Attach key specification files to the Project File Repository for AI context.\n"
            "• Run Ollama AI audits after every 5 hours of logged work."
        )
    }
