import { Ampersand } from "@amp-labs/sdk-node-write";
import { WriteRecordsResponse, WriteRecordsSyncWriteResponseSuccess } from "@amp-labs/sdk-node-write/models/operations";
import { WriteResponse } from "../types";
import { AmpersandConfig, amp } from "../../../config";

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
  config?: Partial<AmpersandConfig>;
}

export async function executeAmpersandWrite({
  objectName,
  type,
  record,
  groupRef,
  associations,
  config: configOverride,
}: WriteParams): Promise<WriteResponse> {
  try {
    const config = configOverride ? amp.init(configOverride) : amp.get();

    const writeSDK = new Ampersand({
      apiKeyHeader: config.apiKey,
    });

    const writeData = {
      projectIdOrName: config.projectId,
      integrationId: config.integrationName,
      objectName,
      requestBody: {
        groupRef: groupRef || config.groupRef,
        type,
        record,
        ...(associations && { associations }),
      },
    };

    const data: WriteRecordsResponse = await writeSDK.write.records(writeData);

    return {
      success: true,
      status: "success",
      recordId: (data as WriteRecordsSyncWriteResponseSuccess)?.result?.recordId || "",
      response: data,
    };
  } catch (error) {
    console.error("Error in write operation:", error);
    return {
      success: false,
      status: "error",
      recordId: "",
      response: error,
    };
  }
} 