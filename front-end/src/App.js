import "./App.css";
import { Route, Switch } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";
import FeedPage from "./Pages/FeedPage";
import TrailsPage from "./Pages/TrailsPage";
import TrailProfilePage from "./Pages/TrailProfilePage";
import NewJournalPage from "./Pages/NewJournalPage";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" component={Homepage} exact />
        <Route path="/feed" component={FeedPage} />
        <Route path="/trails/:id" component={TrailProfilePage} />
        <Route path="/trails" component={TrailsPage} />
        <Route path="/journals/new" component={NewJournalPage} />
        <Route path="/chat" component={ChatPage} />
      </Switch>
    </div>
  );
}

export default App;
