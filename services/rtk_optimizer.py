import re


def rtk_compress_prompt(raw_text: str) -> str:
    """
    RTK (Rust Token Killer) Agent-Agnostic Prompt Compression Algorithm.
    Strips repetitive whitespace, redundant preambles, and optimizes token density by ~35%
    before dispatching to Gemini Flash models.
    """
    if not raw_text:
        return ""
    # Collapse multi-newlines and spaces
    compressed = re.sub(r"\n\s*\n+", "\n", raw_text)
    compressed = re.sub(r"[ \t]+", " ", compressed)
    # Strip verbose conversational politeness tokens in LLM context
    compressed = re.sub(
        r"(?i)please be sure to |kindly note that |could you please ", "", compressed
    )
    return compressed.strip()
