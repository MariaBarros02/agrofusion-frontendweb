import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
  Label,
  Select,
  TextInput,
} from "flowbite-react";
import { useTranslation } from "react-i18next";
import {
  joinProjectApiUrl,
  PROJECT_EXTERNAL_ENDPOINT_SPECS,
} from "../../data/projectEndpointRegistrationSpec";
import type { VariableType } from "../../data/projectEndpointRegistrationSpec";

type EndpointRowState = {
  url: string;
  method: string;
  authWith: boolean;
};

type ResponseBodyRowValues = {
  key: string;
  variableType?: VariableType;
};

const VARIABLE_TYPE_I18N_KEY: Record<VariableType, string> = {
  string: "project.create.endpointResponseBodyTypeString",
  number: "project.create.endpointResponseBodyTypeNumber",
  array: "project.create.endpointResponseBodyTypeArray",
  datetime: "project.create.endpointResponseBodyTypeDatetime",
};

function buildInitialFieldsByIndex(
  fieldKey: "responseBodyFields" | "requestParamFields",
): Record<number, ResponseBodyRowValues[]> {
  const out: Record<number, ResponseBodyRowValues[]> = {};
  PROJECT_EXTERNAL_ENDPOINT_SPECS.forEach((spec, index) => {
    const fields = spec[fieldKey];
    if (!fields) return;
    out[index] = fields.map((row) =>
      row.allowedTypes.length > 1
        ? { key: "", variableType: row.allowedTypes[0] }
        : { key: "" },
    );
  });
  return out;
}

type Props = {
  apiUrlBase: string;
};

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function buildExternalInitialRows(apiUrlBase: string): EndpointRowState[] {
  return PROJECT_EXTERNAL_ENDPOINT_SPECS.map((spec) => ({
    url: spec.urlEmptyWithPlaceholderKey
      ? ""
      : joinProjectApiUrl(apiUrlBase, spec.pathSuffix),
    method: spec.method,
    authWith: spec.requiresAuth,
  }));
}

/**
 * Bloque de referencia: endpoints que el proyecto externo debe registrar / exponer.
 * Debajo de "módulos de acceso rápido" en alta de proyecto.
 */
export function ProjectEndpointRegistrationSection({ apiUrlBase }: Props) {
  const { t } = useTranslation();

  const [externalRows, setExternalRows] = useState<EndpointRowState[]>(() =>
    buildExternalInitialRows(apiUrlBase),
  );
  const [requestParamByIndex, setRequestParamByIndex] = useState<
    Record<number, ResponseBodyRowValues[]>
  >(() => buildInitialFieldsByIndex("requestParamFields"));
  const [requestBodyByIndex, setRequestBodyByIndex] = useState<
    Record<number, ResponseBodyRowValues[]>
  >(() => buildInitialFieldsByIndex("requestBodyFields"));
  const [responseBodyByIndex, setResponseBodyByIndex] = useState<
    Record<number, ResponseBodyRowValues[]>
  >(() => buildInitialFieldsByIndex("responseBodyFields"));

  const updateExternalRow = (index: number, patch: Partial<EndpointRowState>) => {
    setExternalRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const updateRequestParamRow = (
    specIndex: number,
    rowIndex: number,
    patch: Partial<ResponseBodyRowValues>,
  ) => {
    setRequestParamByIndex((prev) => {
      const rows = [...(prev[specIndex] ?? [])];
      rows[rowIndex] = { ...rows[rowIndex], ...patch };
      return { ...prev, [specIndex]: rows };
    });
  };

  const updateRequestBodyRow = (
    specIndex: number,
    rowIndex: number,
    patch: Partial<ResponseBodyRowValues>,
  ) => {
    setRequestBodyByIndex((prev) => {
      const rows = [...(prev[specIndex] ?? [])];
      rows[rowIndex] = { ...rows[rowIndex], ...patch };
      return { ...prev, [specIndex]: rows };
    });
  };

  const updateResponseBodyRow = (
    specIndex: number,
    rowIndex: number,
    patch: Partial<ResponseBodyRowValues>,
  ) => {
    setResponseBodyByIndex((prev) => {
      const rows = [...(prev[specIndex] ?? [])];
      rows[rowIndex] = { ...rows[rowIndex], ...patch };
      return { ...prev, [specIndex]: rows };
    });
  };

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        {t("project.create.registerEndpoint")}
      </h3>

      <Accordion
        collapseAll
        className="border border-gray-200 divide-y rounded-lg dark:border-gray-600 dark:divide-gray-600"
      >
        {PROJECT_EXTERNAL_ENDPOINT_SPECS.map((spec, index) => (
            <AccordionPanel key={spec.title}>
              <AccordionTitle className="text-left text-sm font-medium focus:ring-0 dark:text-white">
                {t(`project.create.${spec.title}`)}
              </AccordionTitle>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-3 pt-1 pb-3 text-sm md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="text-gray-700 dark:text-gray-300">
                      {t("project.create.endpointSpecDescription")}
                    </Label>
                    <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400">
                      {t(`project.create.${spec.description}`)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-end">
                    <div className="min-w-0 flex-1">
                      <Label className="text-gray-700 dark:text-gray-300">
                        {t("project.create.endpointSpecUrl")}
                      </Label>
                      <TextInput
                        sizing="sm"
                        className="mt-1 font-mono text-xs"
                        value={externalRows[index]?.url ?? ""}
                        placeholder={
                          spec.urlEmptyWithPlaceholderKey
                            ? t(
                                `project.create.${spec.urlEmptyWithPlaceholderKey}`,
                              )
                            : undefined
                        }
                        onChange={(e) =>
                          updateExternalRow(index, { url: e.target.value })
                        }
                      />
                    </div>
                    <div className="w-full shrink-0 md:w-32">
                      <Label className="text-gray-700 dark:text-gray-300">
                        {t("project.create.endpointSpecMethod")}
                      </Label>
                      <Select
                        sizing="sm"
                        className="mt-1"
                        value={externalRows[index]?.method ?? "GET"}
                        onChange={(e) =>
                          updateExternalRow(index, { method: e.target.value })
                        }
                      >
                        {HTTP_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-full shrink-0 md:w-52">
                      <Label className="text-gray-700 dark:text-gray-300">
                        {t("project.create.endpointSpecAuth")}
                      </Label>
                      <Select
                        sizing="sm"
                        className="mt-1"
                        value={
                          externalRows[index]?.authWith ? "with" : "without"
                        }
                        onChange={(e) =>
                          updateExternalRow(index, {
                            authWith: e.target.value === "with",
                          })
                        }
                      >
                        <option value="with">
                          {t("project.create.endpointAuthWith")}
                        </option>
                        <option value="without">
                          {t("project.create.endpointAuthWithout")}
                        </option>
                      </Select>
                    </div>
                  </div>
                  {spec.requestParamFields &&
                    spec.requestParamFields.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-gray-700 dark:text-gray-300">
                          {t("project.create.endpointRequestParams")}
                        </Label>
                        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                          <table className="w-full min-w-[420px] table-fixed text-left text-sm">
                            <thead className="bg-gray-50 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              <tr>
                                <th className="w-[30%] px-3 py-2">
                                  {t("project.create.endpointResponseBodyName")}
                                </th>
                                <th className="w-[45%] px-3 py-2">
                                  {t("project.create.endpointResponseBodyKey")}
                                </th>
                                <th className="w-[25%] px-3 py-2">
                                  {t(
                                    "project.create.endpointResponseBodyVariableType",
                                  )}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {spec.requestParamFields.map((field, rowIdx) => {
                                const rowState =
                                  requestParamByIndex[index]?.[rowIdx] ?? {
                                    key: "",
                                    variableType: field.allowedTypes[0],
                                  };
                                const isFixed = field.allowedTypes.length <= 1;
                                return (
                                  <tr
                                    key={`${field.displayName}-${rowIdx}`}
                                    className="bg-white dark:bg-gray-800"
                                  >
                                    <td className="px-3 py-2 text-gray-900 dark:text-white">
                                      {t(`project.create.${field.displayName}`)}
                                    </td>
                                    <td className="px-3 py-2">
                                      <TextInput
                                        sizing="sm"
                                        className="font-mono text-xs"
                                        value={rowState.key}
                                        onChange={(e) =>
                                          updateRequestParamRow(index, rowIdx, {
                                            key: e.target.value,
                                          })
                                        }
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <Select
                                        sizing="sm"
                                        disabled={isFixed}
                                        value={
                                          rowState.variableType ??
                                          field.allowedTypes[0]
                                        }
                                        onChange={(e) =>
                                          updateRequestParamRow(
                                            index,
                                            rowIdx,
                                            {
                                              variableType:
                                                e.target.value as VariableType,
                                            },
                                          )
                                        }
                                      >
                                        {field.allowedTypes.map((vt) => (
                                          <option key={vt} value={vt}>
                                            {t(VARIABLE_TYPE_I18N_KEY[vt])}
                                          </option>
                                        ))}
                                      </Select>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  {spec.requestBodyFields &&
                    spec.requestBodyFields.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-gray-700 dark:text-gray-300">
                          {t("project.create.endpointRequestBody")}
                        </Label>
                        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                          <table className="w-full min-w-[420px] table-fixed text-left text-sm">
                            <thead className="bg-gray-50 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              <tr>
                                <th className="w-[30%] px-3 py-2">
                                  {t("project.create.endpointResponseBodyName")}
                                </th>
                                <th className="w-[45%] px-3 py-2">
                                  {t("project.create.endpointResponseBodyKey")}
                                </th>
                                <th className="w-[25%] px-3 py-2">
                                  {t(
                                    "project.create.endpointResponseBodyVariableType",
                                  )}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {spec.requestBodyFields.map((field, rowIdx) => {
                                const rowState =
                                  requestBodyByIndex[index]?.[rowIdx] ?? {
                                    key: "",
                                    variableType: field.allowedTypes[0],
                                  };
                                const isFixed = field.allowedTypes.length <= 1;
                                return (
                                  <tr
                                    key={`${field.displayName}-${rowIdx}`}
                                    className="bg-white dark:bg-gray-800"
                                  >
                                    <td className="px-3 py-2 text-gray-900 dark:text-white">
                                      {t(`project.create.${field.displayName}`)}
                                    </td>
                                    <td className="px-3 py-2">
                                      <TextInput
                                        sizing="sm"
                                        className="font-mono text-xs"
                                        value={rowState.key}
                                        onChange={(e) =>
                                          updateRequestBodyRow(index, rowIdx, {
                                            key: e.target.value,
                                          })
                                        }
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <Select
                                        sizing="sm"
                                        disabled={isFixed}
                                        value={
                                          rowState.variableType ??
                                          field.allowedTypes[0]
                                        }
                                        onChange={(e) =>
                                          updateRequestBodyRow(
                                            index,
                                            rowIdx,
                                            {
                                              variableType:
                                                e.target.value as VariableType,
                                            },
                                          )
                                        }
                                      >
                                        {field.allowedTypes.map((vt) => (
                                          <option key={vt} value={vt}>
                                            {t(VARIABLE_TYPE_I18N_KEY[vt])}
                                          </option>
                                        ))}
                                      </Select>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  {spec.responseBodyFields &&
                    spec.responseBodyFields.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-gray-700 dark:text-gray-300">
                          {t("project.create.endpointResponseBody")}
                        </Label>
                        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                          <table className="w-full min-w-[420px] table-fixed text-left text-sm">
                            <thead className="bg-gray-50 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              <tr>
                                <th className="w-[30%] px-3 py-2">
                                  {t("project.create.endpointResponseBodyName")}
                                </th>
                                <th className="w-[45%] px-3 py-2">
                                  {t("project.create.endpointResponseBodyKey")}
                                </th>
                                <th className="w-[25%] px-3 py-2">
                                  {t(
                                    "project.create.endpointResponseBodyVariableType",
                                  )}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {spec.responseBodyFields.map((field, rowIdx) => {
                                const rowState =
                                  responseBodyByIndex[index]?.[rowIdx] ?? {
                                    key: "",
                                    variableType: field.allowedTypes[0],
                                  };
                                const isFixed = field.allowedTypes.length <= 1;
                                return (
                                  <tr
                                    key={`${field.displayName}-${rowIdx}`}
                                    className="bg-white dark:bg-gray-800"
                                  >
                                    <td className="px-3 py-2 text-gray-900 dark:text-white">
                                      {t(`project.create.${field.displayName}`)}
                                    </td>
                                    <td className="px-3 py-2">
                                      <TextInput
                                        sizing="sm"
                                        className="font-mono text-xs"
                                        value={rowState.key}
                                        onChange={(e) =>
                                          updateResponseBodyRow(index, rowIdx, {
                                            key: e.target.value,
                                          })
                                        }
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <Select
                                        sizing="sm"
                                        disabled={isFixed}
                                        value={
                                          rowState.variableType ??
                                          field.allowedTypes[0]
                                        }
                                        onChange={(e) =>
                                          updateResponseBodyRow(
                                            index,
                                            rowIdx,
                                            {
                                              variableType:
                                                e.target.value as VariableType,
                                            },
                                          )
                                        }
                                      >
                                        {field.allowedTypes.map((vt) => (
                                          <option key={vt} value={vt}>
                                            {t(VARIABLE_TYPE_I18N_KEY[vt])}
                                          </option>
                                        ))}
                                      </Select>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              </AccordionContent>
            </AccordionPanel>
          ))}
      </Accordion>
    </div>
  );
}
