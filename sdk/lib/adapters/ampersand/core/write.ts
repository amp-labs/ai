import { Ampersand } from "@amp-labs/sdk-node-write";
import {
  WriteRecordsResponse,
  WriteRecordsSyncWriteResponseSuccess,
} from "@amp-labs/sdk-node-write/models/operations";
import { WriteResponse } from "../types";
import * as Sentry from "@sentry/node";
interface WriteParams {
  objectName: string;
  type: "create" | "update";
  record: Record<string, any>;
  groupRef: string;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
  apiKey?: string;
  projectId?: string;
  integrationName?: string;
}

export async function executeAmpersandWrite({
  objectName,
  type,
  record,
  groupRef,
  associations,
  apiKey = process.env.AMPERSAND_API_KEY || "",
  projectId = process.env.AMPERSAND_PROJECT_ID || "",
  integrationName = process.env.AMPERSAND_INTEGRATION_NAME || "",
}: WriteParams): Promise<WriteResponse> {
  try {
    const writeSDK = new Ampersand({
      apiKeyHeader: apiKey,
    });

    const writeData = {
      projectIdOrName: projectId,
      integrationId: integrationName,
      objectName,
      requestBody: {
        groupRef,
        type,
        record,
        ...(associations && { associations }),
      },
    };

    const data: WriteRecordsResponse = await writeSDK.write.records(writeData);

    return {
      success: true,
      status: "success",
      recordId:
        (data as WriteRecordsSyncWriteResponseSuccess)?.result?.recordId || "",
      response: data,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error in write operation:", error);
    return {
      success: false,
      status: "error",
      recordId: "",
      response: error,
    };
  }
}
