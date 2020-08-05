import { Criteria } from "./criteria";

export class Agreement {
    public docType?: string;
    public carId: number;
    public renterId: number;
    public ownerId: number;
    public fromDate: Date;
    public toDate: Date;
    public carPrice: number;
    public totalPrice: number;
    public location: string;
    public destination: string;
    public criteria: string;
}
