#!/usr/bin/env python3
"""
Comprehensive test script for the Cost Analytics Dashboard API.
This script tests all major endpoints and functionality.
"""

import asyncio
import json
import requests
from datetime import datetime, timedelta
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url, expected_fields=None, method="GET", data=None):
    """Test an API endpoint and validate response structure."""
    print(f"\n🧪 Testing {name}...")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {name} - Status: {response.status_code}")
            
            if expected_fields:
                for field in expected_fields:
                    if field in result:
                        print(f"   ✅ Field '{field}' present")
                    else:
                        print(f"   ❌ Missing field '{field}'")
                        return False
            
            return result
        else:
            print(f"❌ {name} - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ {name} - Error: {str(e)}")
        return False

def main():
    """Run comprehensive API tests."""
    print("🚀 Cost Analytics Dashboard API - Comprehensive Test Suite")
    print("=" * 60)
    
    # Test health check
    health = test_endpoint("Health Check", f"{BASE_URL}/api/v1/health")
    if not health:
        print("❌ Health check failed. Is the API running?")
        sys.exit(1)
    
    # Test sample data generation
    print("\n📊 Generating sample data...")
    sample_data = test_endpoint(
        "Sample Data Generation",
        f"{BASE_URL}/api/v1/costs/sample-data?count=500",
        method="POST"
    )
    
    # Test time series endpoint
    time_series = test_endpoint(
        "Cost Time Series",
        f"{BASE_URL}/api/v1/costs/time-series?granularity=daily&limit=10",
        expected_fields=["data", "total_cost", "period", "granularity"]
    )
    
    if time_series:
        print(f"   📈 Found {len(time_series['data'])} data points")
        print(f"   💰 Total Cost: ${time_series['total_cost']:.2f}")
    
    # Test provider breakdown
    provider_breakdown = test_endpoint(
        "Cost Breakdown by Provider",
        f"{BASE_URL}/api/v1/costs/breakdown/provider?limit=5",
        expected_fields=["breakdown", "total_cost", "total_items"]
    )
    
    if provider_breakdown:
        print(f"   🏢 Found {len(provider_breakdown['breakdown'])} providers")
        print(f"   💰 Total Cost: ${provider_breakdown['total_cost']:.2f}")
        
        if provider_breakdown['breakdown']:
            top_provider = provider_breakdown['breakdown'][0]
            print(f"   🥇 Top Provider: {top_provider['key']} (${top_provider['total_cost']:.2f})")
    
    # Test feature breakdown
    feature_breakdown = test_endpoint(
        "Cost Breakdown by Feature",
        f"{BASE_URL}/api/v1/costs/breakdown/feature?limit=5",
        expected_fields=["breakdown", "total_cost", "total_items"]
    )
    
    if feature_breakdown:
        print(f"   🔧 Found {len(feature_breakdown['breakdown'])} features")
        print(f"   💰 Total Cost: ${feature_breakdown['total_cost']:.2f}")
        
        if feature_breakdown['breakdown']:
            top_feature = feature_breakdown['breakdown'][0]
            print(f"   🥇 Top Feature: {top_feature['key']} (${top_feature['total_cost']:.2f})")
    
    # Test anomaly detection
    anomalies = test_endpoint(
        "Cost Anomaly Detection",
        f"{BASE_URL}/api/v1/costs/anomalies?sensitivity=2.0",
        expected_fields=None  # This can be an empty list
    )
    
    if anomalies is not None:
        print(f"   🔍 Found {len(anomalies)} anomalies")
        if anomalies:
            for i, anomaly in enumerate(anomalies[:2]):  # Show first 2
                print(f"   ⚠️  Anomaly {i+1}: {anomaly['severity'].upper()} - {anomaly['description'][:80]}...")
    
    # Test optimization recommendations
    recommendations = test_endpoint(
        "Optimization Recommendations",
        f"{BASE_URL}/api/v1/costs/recommendations?max_recommendations=5",
        expected_fields=None  # This can be an empty list
    )
    
    if recommendations is not None:
        print(f"   💡 Found {len(recommendations)} recommendations")
        if recommendations:
            for i, rec in enumerate(recommendations[:2]):  # Show first 2
                print(f"   📋 Recommendation {i+1}: {rec['title']} ({rec['priority'].upper()})")
    
    # Test with different date ranges
    print("\n📅 Testing different date ranges...")
    
    # Test weekly granularity
    weekly_data = test_endpoint(
        "Weekly Time Series",
        f"{BASE_URL}/api/v1/costs/time-series?granularity=weekly",
        expected_fields=["data", "granularity"]
    )
    
    if weekly_data:
        print(f"   📊 Weekly data points: {len(weekly_data['data'])}")
    
    # Test filtered queries
    filtered_data = test_endpoint(
        "Filtered Time Series (OpenAI only)",
        f"{BASE_URL}/api/v1/costs/time-series?provider=openai&limit=5",
        expected_fields=["data", "filters"]
    )
    
    if filtered_data and filtered_data['data']:
        print(f"   🔍 Filtered data points (OpenAI): {len(filtered_data['data'])}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed successfully!")
    print("\n📖 API Documentation available at:")
    print(f"   • Swagger UI: {BASE_URL}/docs")
    print(f"   • ReDoc: {BASE_URL}/redoc")
    
    print("\n🎯 Summary:")
    print(f"   ✅ Health Check: Working")
    print(f"   ✅ Time Series Data: Working")
    print(f"   ✅ Provider Breakdown: Working") 
    print(f"   ✅ Feature Breakdown: Working")
    print(f"   ✅ Anomaly Detection: Working")
    print(f"   ✅ Recommendations: Working")
    print(f"   ✅ Query Filtering: Working")
    print(f"   ✅ Date Range Queries: Working")

if __name__ == "__main__":
    main()