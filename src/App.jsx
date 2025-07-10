import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [dogImage, setDogImage] = useState(null);
  const [breedName, setBreedName] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const maxRetries = 15;

  const extractBreedFromUrl = (url) => {
    try {
      const breedPart = url.split('/breeds/')[1].split('/')[0];
      return breedPart
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch {
      return 'Unknown';
    }
  };

  const fetchDog = async () => {
    setLoading(true);
    let attempts = 0;
    let imageUrl = null;
    let breed = null;

    while (attempts < maxRetries) {
      attempts++;
      try {
        const res = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await res.json();

        if (data.status !== 'success') continue;

        const url = data.message;
        const extractedBreed = extractBreedFromUrl(url);

        if (banList.includes(extractedBreed) || banList.includes('Friendly') || banList.includes('Active')) {
          continue;
        }

        imageUrl = url;
        breed = extractedBreed;
        break;
      } catch {
        continue;
      }
    }

    if (imageUrl && breed) {
      setDogImage(imageUrl);
      setBreedName(breed);
      setHistory(prev => [{ image: imageUrl, breed }, ...prev]);
    } else {
      setDogImage(null);
      setBreedName(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDog();
  }, [banList]);

  const addBan = (value) => {
    if (!banList.includes(value)) {
      setBanList([...banList, value]);
    }
  };

  const removeBan = (value) => {
    setBanList(banList.filter(item => item !== value));
  };

  return (
    <div className="app-container">
      {/* Left - History */}
      <section className="history-section">
        <h2>📜 History of Seen Dogs</h2>
        {history.length === 0 ? (
          <p>You have not discovered any dogs yet.</p>
        ) : (
          <div className="history-list">
            {history.map(({ image, breed }, idx) => (
              <div key={idx} className="history-item">
                <img src={image} alt={breed} />
                <span>{breed}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Middle - Current Dog */}
      <main className="current-dog">
        <h1>🐕 Dog Discoverer</h1>

        {loading && <p>Loading a dog for you...</p>}

        {!loading && dogImage && (
          <>
            <img src={dogImage} alt={breedName} />
            <div className="attributes-container">
  <p>
    <strong>Breed:</strong>{' '}
    <span
      className="clickable-attribute"
      onClick={() => addBan(breedName)}
      title="Click to ban this breed"
    >
      {breedName}
    </span>
  </p>
  <p>
    <strong>Attribute 1:</strong>{' '}
    <span
      className="clickable-attribute"
      onClick={() => addBan('Friendly')}
      title="Click to ban this attribute"
    >
      Friendly
    </span>
  </p>
  <p>
    <strong>Attribute 2:</strong>{' '}
    <span
      className="clickable-attribute"
      onClick={() => addBan('Active')}
      title="Click to ban this attribute"
    >
      Active
    </span>
  </p>
</div>
            
          </>
        )}

        <button className="discover-btn" onClick={fetchDog}>
          Discover Another Dog
        </button>
      </main>

      {/* Right - Ban List */}
      <aside className="ban-list-section">
        <h2>🚫 Ban List</h2>
        {banList.length === 0 ? (
          <p>No banned attributes yet. Click any attribute above to ban it.</p>
        ) : (
          <ul className="ban-list">
            {banList.map((item, idx) => (
              <li key={idx}>
                <span
                  className="ban-list-item"
                  onClick={() => removeBan(item)}
                  title="Click to remove from ban list"
                >
                  {item} ❌
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default App;
