import "./App.scss";
import MainWindow from "./components/main_window/main_window";
import MenuBar from "./components/menu_bar/menu_bar";
import Toolbar from "./components/toolbar/toolbar";

export default function App() {
  return (
    <main>
      <Toolbar />
      <div className="App">
        <MenuBar />
        <MainWindow />
      </div>
    </main>
  );
}
