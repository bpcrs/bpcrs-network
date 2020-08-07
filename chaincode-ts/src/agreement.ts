
export class Agreement {
    public docType?: string;
    public carId: number;
    public renter: string;
    public owner: string;
    public fromDate: Date;
    public toDate: Date;
    public carPrice: number;
    public totalPrice: number;
    public location: string;
    public destination: string;
    public criteria: string;
    public signature?: string;
    public timeSign?: Date;
}
