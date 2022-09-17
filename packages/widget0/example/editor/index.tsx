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
  Outlet,
} from "react-router-dom";
import { create, DatabaseProvider, load, useDatabase } from "./database";

import { TagSearch } from "./react/lib/TagSearch";
import { WidgetEditor } from "./react/lib/WidgetEditor";

import "./index.css";
import { InputModalHost } from "./react/lib/InputModalHost";
import { ErrorBoundary } from "./react/lib/ErrorBoundary";
import { isFoundationDefintion } from "../../widget-data";
import { WidgetPreview } from "./react/lib/WidgetPreview";

const App = () => {
  return (
    <HashRouter>
      <div>
        <NavLink to={"/"}>Home</NavLink>{" "}
        <NavLink to={"/widget/new"}>Create</NavLink>
      </div>
      <Routes>
        <Route path="/" element={<TagSearchPage />}></Route>
        <Route path="widget/new" element={<CreateWidgetPage />}></Route>
        <Route
          path="widget/:widgetId"
          element={
            <ErrorBoundary>
              <WidgetEditorPage />
            </ErrorBoundary>
          }
        >
          <Route path="" element={<TagSearchPreviewPage />} />
          <Route
            path="preview/:previewId"
            element={<WidgetEditorPreviewPage />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
};

const TagSearchPage = () => <TagSearch />;

const TagSearchPreviewPage = () => {
  const { widgetId = "" } = useParams();
  const database = useDatabase();
  const def = database.get(widgetId);
  if ("create" in def) {
    throw new Error();
  }
  return <TagSearch linkPrefix="preview" />;
};

const WidgetEditorPage = () => {
  const { widgetId = "" } = useParams();
  const database = useDatabase();
  const def = database.get(widgetId);
  if ("create" in def) {
    throw new Error();
  }
  return (
    <table width="100%">
      <tr>
        <td width="50%">
          <div
          // style={{ position: "absolute", overflow: "scroll", height: "100%" }}
          >
            <div>
              <WidgetEditor
                data={def}
                setData={(data) => database.update(data)}
              />
            </div>
          </div>
        </td>
        <td valign="top" width="50%">
          <Outlet />
        </td>
      </tr>
    </table>
  );
};

const WidgetEditorPreviewPage = () => {
  const { previewId = "" } = useParams();
  const database = useDatabase();
  const def = database.get(previewId);
  if (isFoundationDefintion(def)) {
    throw new Error();
  }
  return (
    <>
      <div>
        <Link to="./../..">Back</Link>
      </div>
      <ErrorBoundary>
        <WidgetPreview def={def} params={{}} />
      </ErrorBoundary>
    </>
  );
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
