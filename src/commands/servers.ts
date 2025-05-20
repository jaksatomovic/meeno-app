import { invoke } from "@tauri-apps/api/core";

import {
  ServerTokenResponse,
  Server,
  Connector,
  DataSource,
  GetResponse,
  UploadAttachmentPayload,
  UploadAttachmentResponse,
  GetAttachmentPayload,
  GetAttachmentResponse,
  DeleteAttachmentPayload,
  TranscriptionPayload,
  TranscriptionResponse,
  MultiSourceQueryResponse,
} from "@/types/commands";
import { useAppStore } from "@/stores/appStore";

async function invokeWithErrorHandler<T>(
  command: string,
  args?: Record<string, any>
): Promise<T> {
  const addError = useAppStore.getState().addError;
  try {
    const result = await invoke<T>(command, args);
    // console.log(command, result);

    if (result && typeof result === "object" && "failed" in result) {
      const failedResult = result as any;
      if (failedResult.failed?.length > 0 && failedResult?.hits?.length == 0) {
        failedResult.failed.forEach((error: any) => {
          addError(error.error, 'error');
          // console.error(error.error);
        });
      }
    }

    if (typeof result === "string") {
      const res = JSON.parse(result);
      if (typeof res === "string") {
        throw new Error(result);
      }
    }

    return result;
  } catch (error: any) {
    const errorMessage = error || "Command execution failed";
    addError(command + ":" + errorMessage, "error");
    throw error;
  }
}

export function get_server_token(id: string): Promise<ServerTokenResponse> {
  return invokeWithErrorHandler(`get_server_token`, { id });
}

export function list_coco_servers(): Promise<Server[]> {
  return invokeWithErrorHandler(`list_coco_servers`);
}

export function add_coco_server(endpoint: string): Promise<Server> {
  return invokeWithErrorHandler(`add_coco_server`, { endpoint });
}

export function enable_server(id: string): Promise<void> {
  return invokeWithErrorHandler(`enable_server`, { id });
}

export function disable_server(id: string): Promise<void> {
  return invokeWithErrorHandler(`disable_server`, { id });
}

export function remove_coco_server(id: string): Promise<void> {
  return invokeWithErrorHandler(`remove_coco_server`, { id });
}

export function logout_coco_server(id: string): Promise<void> {
  return invokeWithErrorHandler(`logout_coco_server`, { id });
}

export function refresh_coco_server_info(id: string): Promise<Server> {
  return invokeWithErrorHandler(`refresh_coco_server_info`, { id });
}

export function handle_sso_callback({
  serverId,
  requestId,
  code,
}: {
  serverId: string;
  requestId: string;
  code: string;
}): Promise<void> {
  return invokeWithErrorHandler(`handle_sso_callback`, {
    serverId,
    requestId,
    code,
  });
}

export function get_connectors_by_server(id: string): Promise<Connector[]> {
  return invokeWithErrorHandler(`get_connectors_by_server`, { id });
}

export function datasource_search(id: string): Promise<DataSource[]> {
  return invokeWithErrorHandler(`datasource_search`, { id });
}

export function mcp_server_search(id: string): Promise<DataSource[]> {
  return invokeWithErrorHandler(`mcp_server_search`, { id });
}

export function connect_to_server(id: string, clientId: string): Promise<void> {
  return invokeWithErrorHandler(`connect_to_server`, { id, clientId });
}

export function disconnect(clientId: string): Promise<void> {
  return invokeWithErrorHandler(`disconnect`, { clientId });
}

export function chat_history({
  serverId,
  from = 0,
  size = 20,
  query = "",
}: {
  serverId: string;
  from?: number;
  size?: number;
  query?: string;
}): Promise<string> {
  return invokeWithErrorHandler(`chat_history`, {
    serverId,
    from,
    size,
    query,
  });
}

export function session_chat_history({
  serverId,
  sessionId,
  from = 0,
  size = 20,
}: {
  serverId: string;
  sessionId: string;
  from?: number;
  size?: number;
}): Promise<string> {
  return invokeWithErrorHandler(`session_chat_history`, {
    serverId,
    sessionId,
    from,
    size,
  });
}

export function close_session_chat({
  serverId,
  sessionId,
}: {
  serverId: string;
  sessionId: string;
}): Promise<string> {
  return invokeWithErrorHandler(`close_session_chat`, {
    serverId,
    sessionId,
  });
}

export function open_session_chat({
  serverId,
  sessionId,
}: {
  serverId: string;
  sessionId: string;
}): Promise<string> {
  return invokeWithErrorHandler(`open_session_chat`, {
    serverId,
    sessionId,
  });
}

export function cancel_session_chat({
  serverId,
  sessionId,
}: {
  serverId: string;
  sessionId: string;
}): Promise<string> {
  return invokeWithErrorHandler(`cancel_session_chat`, {
    serverId,
    sessionId,
  });
}

export function new_chat({
  serverId,
  websocketId,
  message,
  queryParams,
}: {
  serverId: string;
  websocketId?: string;
  message: string;
  queryParams?: Record<string, any>;
}): Promise<GetResponse> {
  return invokeWithErrorHandler(`new_chat`, {
    serverId,
    websocketId,
    message,
    queryParams,
  });
}

export function send_message({
  serverId,
  websocketId,
  sessionId,
  message,
  queryParams,
}: {
  serverId: string;
  websocketId?: string;
  sessionId: string;
  message: string;
  queryParams?: Record<string, any>;
}): Promise<string> {
  return invokeWithErrorHandler(`send_message`, {
    serverId,
    websocketId,
    sessionId,
    message,
    queryParams,
  });
}

export const delete_session_chat = (serverId: string, sessionId: string) => {
  return invokeWithErrorHandler<boolean>(`delete_session_chat`, {
    serverId,
    sessionId,
  });
};

export const update_session_chat = (payload: {
  serverId: string;
  sessionId: string;
  title?: string;
  context?: {
    attachments?: string[];
  };
}): Promise<boolean> => {
  return invokeWithErrorHandler<boolean>("update_session_chat", payload);
};

export const assistant_search = (payload: {
  serverId: string;
}): Promise<boolean> => {
  return invokeWithErrorHandler<boolean>("assistant_search", payload);
};

export const upload_attachment = async (payload: UploadAttachmentPayload) => {
  const response = await invokeWithErrorHandler<UploadAttachmentResponse>(
    "upload_attachment",
    {
      ...payload,
    }
  );

  if (response?.acknowledged) {
    return response.attachments;
  }
};

export const get_attachment = (payload: GetAttachmentPayload) => {
  return invokeWithErrorHandler<GetAttachmentResponse>("get_attachment", {
    ...payload,
  });
};

export const delete_attachment = (payload: DeleteAttachmentPayload) => {
  return invokeWithErrorHandler<boolean>("delete_attachment", { ...payload });
};

export const transcription = (payload: TranscriptionPayload) => {
  return invokeWithErrorHandler<TranscriptionResponse>("transcription", {
    ...payload,
  });
};

export const query_coco_fusion = (payload: {
  from: number;
  size: number;
  queryStrings: Record<string, string>;
  queryTimeout: number;
}) => {
  return invokeWithErrorHandler<MultiSourceQueryResponse>("query_coco_fusion", {
    ...payload,
  });
};
