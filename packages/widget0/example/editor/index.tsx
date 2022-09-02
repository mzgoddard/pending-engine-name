import React from "react";
import { render } from "react-dom";
import {
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { create, DatabaseProvider, load, useDatabase } from "./database";

import { TagSearch } from "./react/lib/TagSearch";
import { WidgetEditor } from "./react/lib/WidgetEditor";

import "./index.css";
import { InputModalHost } from "./react/lib/InputModalHost";
import { ErrorBoundary } from "./react/lib/ErrorBoundary";

const App = () => {
  return (
    <HashRouter>
      <div>
        <NavLink to={"/"}>Home</NavLink>{" "}
        <NavLink to={"/widget/new"}>Create</NavLink>
      </div>
      <Routes>
        <Route path="/" element={<TagSearchPage />}></Route>
        <Route path="/widget/new" element={<CreateWidgetPage />}></Route>
        <Route
          path="/widget/:widgetId/edit"
          element={
            <ErrorBoundary>
              <WidgetEditorPage />
            </ErrorBoundary>
          }
        ></Route>
      </Routes>
    </HashRouter>
  );
};

const TagSearchPage = () => <TagSearch />;

const WidgetEditorPage = () => {
  const { widgetId = "" } = useParams();
  const database = useDatabase();
  const def = database.get(widgetId);
  if ("create" in def) {
    throw new Error();
  }
  return <WidgetEditor data={def} setData={(data) => database.update(data)} />;
};

const CreateWidgetPage = () => {
  const navigate = useNavigate();
  const database = useDatabase();
  return (
    <div>
      <button
        onClick={() => {
          const id = Array.from({ length: 32 }, () =>
            (Math.random() * 16).toString(16).substring(0, 1),
          ).join("");
          database.update({
            id,
            tags: [],
            parameters: {},
            body: { direct: "" },
          });
          navigate(`/widget/${id}/edit`);
        }}
      >
        Create
      </button>
    </div>
  );
};

const LoadDatabase = React.lazy(async () => {
  const db = await load();
  return {
    default: ({ children }) => (
      <DatabaseProvider value={db}>{children}</DatabaseProvider>
    ),
  };
});

render(
  <React.Suspense>
    <LoadDatabase>
      <InputModalHost>
        <App></App>
      </InputModalHost>
    </LoadDatabase>
  </React.Suspense>,
  document.getElementById("root"),
);
