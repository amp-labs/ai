// Type definitions for the parameters
export type CreateParams = {
  objectName: string;
  type: 'create';
  record: Record<string, any>;
  groupRef: string;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
};

export type UpdateParams = {
  objectName: string;
  type: 'update';
  record: Record<string, any>;
  groupRef: string;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
};

export type WriteResponse = {
  success: boolean;
  status: string;
  recordId: string;
  response: any;
};
