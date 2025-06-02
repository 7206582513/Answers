import os
import cv2
import numpy as np
from pdf2image import convert_from_path, convert_from_bytes
from typing import List, Dict, Any
import asyncio
from modules.enhanced_vision import CNNChartClassifier, EnhancedImageProcessor
from modules.enhanced_chat import IntelligentChatEngine


class PDFProcessor:
    """Process PDF files and extract chart data"""

    def __init__(self, groq_api_key: str, groq_api_url: str, groq_model: str):
        self.chart_classifier = CNNChartClassifier()
        self.image_processor = EnhancedImageProcessor()
        self.chat_engine = IntelligentChatEngine(groq_api_key, groq_api_url, groq_model)

    async def analyze_pdf_charts(self, pdf_path: str, dataset=None) -> Dict[str, Any]:
        """Analyze charts in PDF file"""
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=200)

            results = {
                "total_charts": 0,
                "charts": [],
                "summary_insights": []
            }

            chart_data = []

            for page_num, image in enumerate(images, 1):
                # Convert PIL image to numpy array
                img_array = np.array(image)

                # Extract chart regions
                chart_regions = self.image_processor.extract_chart_regions(img_array)

                for region_idx, region in enumerate(chart_regions):
                    # Classify chart type
                    chart_type, confidence = self.chart_classifier.classify_chart(region)

                    if confidence > 0.5:  # Only process charts with reasonable confidence
                        # Extract data from chart
                        extracted_data = self.image_processor.extract_chart_data(region, chart_type)

                        # Generate insights
                        insights = await self.chat_engine.generate_chart_insights(
                            chart_type, extracted_data, dataset
                        )

                        chart_info = {
                            "page": page_num,
                            "region": region_idx,
                            "type": chart_type,
                            "confidence": confidence,
                            "data": extracted_data,
                            "insights": insights
                        }

                        chart_data.append(chart_info)
                        results["charts"].append(chart_info)
                        results["total_charts"] += 1

            # Generate summary insights
            if chart_data:
                summary_insights = await self.chat_engine.generate_summary_insights(
                    chart_data, dataset
                )
                results["summary_insights"] = summary_insights

            return results

        except Exception as e:
            print(f"PDF processing error: {e}")
            return {
                "total_charts": 0,
                "charts": [],
                "summary_insights": [],
                "error": str(e)
            }


# Function to be imported by api.py
async def analyze_pdf_charts(pdf_path: str, dataset=None) -> Dict[str, Any]:
    """Wrapper function for PDF chart analysis"""
    import os

    # Get environment variables
    groq_api_key = os.getenv('GROQ_API_KEY')
    groq_api_url = os.getenv('GROQ_API_URL')
    groq_model = os.getenv('GROQ_MODEL')

    processor = PDFProcessor(groq_api_key, groq_api_url, groq_model)
    return await processor.analyze_pdf_charts(pdf_path, dataset)
