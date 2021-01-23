import './App.css';
import Leaf from './map/Leaf';

function App() {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <Leaf
        dataFile={'gpw_v4_population_count_rev11_2020_2pt5_min.cog.tif'}
      ></Leaf>
    </div>
  );
}

export default App;
