import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/NasaApiTest.scss';

const NASA_API_KEY = 'q1T3xI2vSxmmFgjDD628gld32e5uMkpYeabnKiKI';

const NasaApiTest = () => {
  const [apodData, setApodData] = useState(null);
  const [epicData, setEpicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApod = async () => {
      try {
        const response = await axios.get(
          `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        );
        setApodData(response.data);
        console.log('APOD API Test - Success:', response.data);
      } catch (err) {
        console.error('APOD API Test - Error:', err);
        setError(err.message);
      }
    };

    const testEpic = async () => {
      try {
        const response = await axios.get(
          `https://api.nasa.gov/EPIC/api/natural/available?api_key=${NASA_API_KEY}`
        );
        setEpicData(response.data);
        console.log('EPIC API Test - Success:', response.data);
      } catch (err) {
        console.error('EPIC API Test - Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testApod();
    testEpic();
  }, []);

  if (loading) {
    return (
      <div className="nasa-test">
        <div className="loading">Testing NASA API Integration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nasa-test">
        <div className="error">
          <h2>Error Testing NASA API</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nasa-test">
      <h2>NASA API Integration Test Results</h2>
      
      <div className="test-section">
        <h3>Astronomy Picture of the Day (APOD)</h3>
        {apodData && (
          <div className="test-result success">
            <h4>✅ APOD API Test Successful</h4>
            <div className="apod-data">
              <h5>{apodData.title}</h5>
              <p>{apodData.explanation}</p>
              {apodData.url && (
                <img 
                  src={apodData.url} 
                  alt={apodData.title}
                  style={{ maxWidth: '300px' }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>EPIC (Earth Polychromatic Imaging Camera)</h3>
        {epicData && (
          <div className="test-result success">
            <h4>✅ EPIC API Test Successful</h4>
            <div className="epic-data">
              <p>Available dates: {epicData.length}</p>
              <p>Latest date: {epicData[0]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NasaApiTest; 