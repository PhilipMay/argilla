import { useRoute, useRouter } from "@nuxtjs/composition-api";
import { Dataset } from "@/v1/domain/entities/Dataset";

type KindOfParam =
  | "_status"
  | "_page"
  | "_search"
  | "_metadata"
  | "_sort"
  | "_response"
  | "_suggestion"
  | "_similarity";

export const ROUTES = {
  datasets: "datasets",
};
export const useRoutes = () => {
  const router = useRouter();
  const route = useRoute();

  const isOldTask = (task: string) => {
    return ["TokenClassification", "TextClassification", "Text2Text"].includes(
      task
    );
  };

  const getDatasetLink = ({ task, name, workspace, id }: Dataset): string => {
    return isOldTask(task)
      ? `/datasets/${workspace}/${name}`
      : `/dataset/${id}/annotation-mode`;
  };

  const goToSetting = ({ task, workspace, name, id }: Dataset) => {
    if (isOldTask(task)) {
      router.push({
        name: "datasets-workspace-dataset-settings",
        params: {
          workspace,
          dataset: name,
        },
      });
    } else {
      router.push({
        name: "dataset-id-settings",
        params: { id },
      });
    }
  };

  const goToDatasetsList = () => {
    router.push({ path: `/${ROUTES.datasets}` });
  };

  type QueryParam = {
    key: KindOfParam;
    value: string;
    encode?: boolean;
  };

  const setQueryParams = async (...params: QueryParam[]) => {
    const actualQuery = route.value.query;
    const funcToUse = Object.keys(actualQuery).length ? "push" : "replace";
    let newQuery = {};

    params.forEach(({ key, value }) => {
      if (!value) return;

      newQuery = {
        ...newQuery,
        [key]: encodeURIComponent(value),
      };
    });

    await router[funcToUse]({
      path: route.value.path,
      query: {
        ...newQuery,
      },
    });
  };

  const getQueryParams = <T>(key: KindOfParam): T => {
    const value = route.value.query[key] as string;
    if (!value) return;

    return decodeURIComponent(value) as T;
  };

  return {
    goToDatasetsList,
    goToSetting,
    getDatasetLink,
    setQueryParams,
    getQueryParams,
    watchBrowserNavigation: (callBack: () => void) => {
      window.addEventListener("popstate", callBack);
    },
  };
};
