import json

from langchain_ollama import ChatOllama


llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    format="json",
    num_predict=500
)


def extract_evidence(document_text):
    """
    Extract structured inspection evidence
    from an industrial inspection document.
    """

    # Keep the input manageable for the local model.
    document_text = document_text[:6000]

    prompt = f"""
Extract inspection information from the document.

Use ONLY information explicitly written in the document.
Do NOT invent missing information.

Return ONLY one valid JSON object.

Required JSON structure:

{{
  "equipment_id": null,
  "equipment_type": null,
  "inspection_date": null,
  "location": null,
  "findings": [],
  "measurements": [],
  "severity": null,
  "recommendations": [],
  "other_evidence": []
}}

Rules:

- Missing values must be null.
- Missing lists must be [].
- findings must contain explicitly stated inspection findings.
- measurements must contain explicitly stated measurements.
- recommendations must contain explicitly stated recommendations.
- Do not calculate values.
- Do not infer severity.
- Do not use outside knowledge.
- Do not explain your answer.
- Return JSON only.

DOCUMENT:

{document_text}
"""

    response = llm.invoke(prompt)

    content = response.content.strip()

    try:
        evidence = json.loads(content)

    except json.JSONDecodeError:

        print("MODEL RAW OUTPUT:")
        print(content)

        return {
            "error": "The local model did not return valid JSON.",
            "raw_output": content
        }

    return evidence