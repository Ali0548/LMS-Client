import { TableColumns } from "./components/Datatable/types";

export interface School{
    id:string,
    type:string,
    grades:Grade[],
    createdAt:string,
    updatedAt:string,
}

export interface Grade{
    id:string,
    type:string,
}

export interface DatatableWithSearchProps<T> {
    tableColumns: TableColumns[];
    data: T[];
    loading?: boolean;
  }