from langchain_ollama import ChatOllama


MODEL_REGISTRY = {
    "reasoning": "llama3.2:3b",
    "coding": "qwen2.5-coder:3b",
}


def get_model(task_type):
    """
    Return the local model assigned to a specific task.
    """

    model_name = MODEL_REGISTRY.get(task_type)

    if not model_name:
        raise ValueError(f"No model configured for task: {task_type}")

    print(f"Model selected for {task_type}: {model_name}")

    return ChatOllama(
        model=model_name,
        temperature=0,
    )


def list_models():
    """
    Return the currently configured local model pool.
    """

    return MODEL_REGISTRY