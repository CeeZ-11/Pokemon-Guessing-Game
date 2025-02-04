import "./App.css";
import axios from "axios";
import { useState, useEffect } from "react";

export default function App() {
  const [pokemon, setPokemon] = useState({});
  const [description, setDescription] = useState(""); // Stores Pokémon description
  const [isHidden, setIsHidden] = useState(true);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Get voices once speech synthesis is initialized
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    window.speechSynthesis.onvoiceschanged = fetchVoices;

    fetchVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const fetchApi = async () => {
    const randomId = Math.floor(Math.random() * 1025) + 1; // Random Pokémon ID

    try {
      // Fetch Pokémon data
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${randomId}`
      );

      const data = {
        id: response.data.id,
        name: response.data.name,
        image: response.data.sprites.front_shiny,
        cry: response.data.cries.latest,
      };

      setPokemon(data);

      // Fetch Pokémon species data (for description)
      fetchDescription(data.id);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  const fetchDescription = async (id) => {
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${id}/`
      );

      // Find the first English description
      const englishText = response.data.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );

      setDescription(
        englishText ? englishText.flavor_text : "No description available."
      );
    } catch (error) {
      console.error("❌ Error fetching description:", error);
    }
  };

  const speakDescription = () => {
    if (description) {
      const speech = new SpeechSynthesisUtterance(description);
      const voices = window.speechSynthesis.getVoices();

      // Try to find the UK English Female voice
      const announcerVoice = voices.find((voice) =>
        voice.name.includes("Google UK English Female")
      );

      if (announcerVoice) {
        speech.voice = announcerVoice;
      }

      speech.text = `${pokemon.name.toUpperCase()}! ${description}`;
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div className="App">
      <h1>Pokemon Guessing Game</h1>
      <button onClick={fetchApi}>Get Pokemon</button>

      <img src={pokemon.image} alt={pokemon.name} width={300} height={300} />
      <button onClick={() => setIsHidden(!isHidden)}>Toggle Name</button>
      {!isHidden && <p>{pokemon.name}</p>}
      {!isHidden && (
        <button onClick={speakDescription}>🔊 Read Description</button>
      )}
      <pre>{pokemon.species}</pre>

      <audio key={pokemon.id} controls>
        <source src={pokemon.cry} type="audio/ogg" />
      </audio>
    </div>
  );
}
