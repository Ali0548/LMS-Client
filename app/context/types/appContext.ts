import { Toaster } from "../../shared/types";
import { NewData } from "./NewData";
import { ServiceResponse } from "./services";

export interface  AppContextProps {
    message: string;
    pageLoader: PageLoader
    createSchoolHandler: (CreateSchoolHandler:ServiceResponse) => ServiceResponse;
    toaster: Toaster;
    setToaster: (newToaster: Toaster) => void;
    newData: NewData;
}
export interface MainContextProviderProps {
    children: React.ReactNode;
}

export interface PageLoader {
    pageLoading:number;
    setPageLoading: (newPageLoading: number) => void;
    primeReactLoader: boolean;
    setPrimeReactLoader: (newPrimeReactLoader: boolean) => void;
}
export interface ToasterData {
    toaster: Toaster;
    setToaster: (newToaster: Toaster) => void;
}
