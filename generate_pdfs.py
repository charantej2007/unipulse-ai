import csv
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

def generate_pdf(filename, title, topics):
    filepath = os.path.join("resources", "documents", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Title Style
    title_style = ParagraphStyle(
        name='CustomTitle', 
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=24,
        spaceAfter=20
    )
    
    # Custom Body Style
    body_style = ParagraphStyle(
        name='CustomBody',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=12,
        leading=18
    )
    
    story = []
    
    # Title
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 20))
    
    # Content Paragraph 1
    p1_text = f"Welcome to the comprehensive guide on {title}. This document covers essential concepts and practical applications relevant to this field. Mastery of these topics is crucial for your career development and academic success."
    story.append(Paragraph(p1_text, body_style))
    story.append(Spacer(1, 10))
    
    # Topics Section
    story.append(Paragraph("<b>Key Topics Covered:</b>", styles['Heading3']))
    
    for topic in topics.split():
        topic_text = f"• {topic.replace('_', ' ')}: Understanding the fundamental principles and advanced techniques."
        story.append(Paragraph(topic_text, body_style))
    
    story.append(Spacer(1, 20))
    
    # Content Paragraph 2
    p2_text = "To truly excel in this subject, it is recommended to supplement this reading with hands-on practice, practical projects, and by engaging with the provided YouTube links for visual learning."
    story.append(Paragraph(p2_text, body_style))
    
    # Build PDF
    doc.build(story)
    print(f"Generated {filepath}")

if __name__ == "__main__":
    with open('resources/metadata.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            subject = row['subject'].strip()
            filename = row['document_name'].strip()
            topics = row['topics'].strip()
            if filename:
                generate_pdf(filename, subject, topics)
                
    print("All PDFs generated successfully!")
