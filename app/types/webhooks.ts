export type OrderNoteAttribute = {
  name?: string | null;
  value?: string | null;
};

export type OrdersCreateWebhookPayload = {
  id?: number | string | null;
  admin_graphql_api_id?: string | null;
  note_attributes?: OrderNoteAttribute[] | null;
};

