from backend.tools.document_generator import generate_word, generate_pdf


title = "Confidential Information Report"

content = """
Employees should lock or secure confidential information at all times.

Confidential information should only be disclosed to authorized individuals.

Confidential documents should be handled securely.
"""


word_file = generate_word(title, content)
pdf_file = generate_pdf(title, content)


print("Word document created:")
print(word_file)

print("\nPDF document created:")
print(pdf_file)