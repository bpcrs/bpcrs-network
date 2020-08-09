/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import {Agreement} from './agreement';
import { Car } from './car';

const DOC_TYPE = {
    AGREEMENT : 'AGREEMENT',
};
const COPY_TYPE = {
    OWNER : "OWNER",
    RENTER: "RENTER"
}
export class FabCar extends Contract {

    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        // const cars: Car[] = [
        //     {
        //         color: 'blue',
        //         make: 'Toyota',
        //         model: 'Prius',
        //         owner: 'Tomoko',
        //     },
        //     {
        //         color: 'red',
        //         make: 'Ford',
        //         model: 'Mustang',
        //         owner: 'Brad',
        //     },
        //     {
        //         color: 'green',
        //         make: 'Hyundai',
        //         model: 'Tucson',
        //         owner: 'Jin Soo',
        //     },
        //     {
        //         color: 'yellow',
        //         make: 'Volkswagen',
        //         model: 'Passat',
        //         owner: 'Max',
        //     },
        //     {
        //         color: 'black',
        //         make: 'Tesla',
        //         model: 'S',
        //         owner: 'Adriana',
        //     },
        //     {
        //         color: 'purple',
        //         make: 'Peugeot',
        //         model: '205',
        //         owner: 'Michel',
        //     },
        //     {
        //         color: 'white',
        //         make: 'Chery',
        //         model: 'S22L',
        //         owner: 'Aarav',
        //     },
        //     {
        //         color: 'violet',
        //         make: 'Fiat',
        //         model: 'Punto',
        //         owner: 'Pari',
        //     },
        //     {
        //         color: 'indigo',
        //         make: 'Tata',
        //         model: 'Nano',
        //         owner: 'Valeria',
        //     },
        //     {
        //         color: 'brown',
        //         make: 'Holden',
        //         model: 'Barina',
        //         owner: 'Shotaro',
        //     },
        // ];

        // for (let i = 0; i < cars.length; i++) {
        //     cars[i].docType = 'car';
        //     await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
        //     console.info('Added <--> ', cars[i]);
        // }
        console.info('============= END : Initialize Ledger ===========');
    }

    public async queryCar(ctx: Context, carNumber: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    public async createCar(ctx: Context, carNumber: string, make: string, model: string, color: string, owner: string) {
        console.info('============= START : Create Car ===========');

        const car: Car = {
            color,
            docType: 'car',
            make,
            model,
            owner,
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
    }

    public async queryAllCars(ctx: Context): Promise<string> {
        const startKey = 'CAR0';
        const endKey = 'CAR999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    public async changeCarOwner(ctx: Context, carNumber: string, newOwner: string) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car: Car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

    public async submitContract(ctx: Context, key: string, carId: number, renter: string, owner: string,
                                fromDate: Date, toDate: Date, location: string, destination: string,
                                carPrice: number, totalPrice: number, criteria: string): Promise<string> {
        console.info('============= START : submitContract ===========');
        const agreement: Agreement = {
            carId, owner, renter,
            fromDate,
            toDate,
            totalPrice,
            carPrice,
            location,
            destination,
            docType : DOC_TYPE.AGREEMENT,
            criteria : JSON.parse(criteria),
            signature : '',
        };
        await ctx.stub.putState(`${this.getCompositeKeyAgreement(key,COPY_TYPE.OWNER)}`, Buffer.from(JSON.stringify(agreement)));
        await ctx.stub.putState(`${this.getCompositeKeyAgreement(key,COPY_TYPE.RENTER)}`, Buffer.from(JSON.stringify(agreement)));
        console.info('============= END : submitContract ===========');
        return key;
    }
    private getCompositeKeyAgreement(key: string, copyType: string){
        return `${DOC_TYPE.AGREEMENT}_${copyType}_${key}`
    }
    public async queryContract(ctx: Context, key: string, copyType: string) {
        console.info('============= START : queryContract ===========');
        const agreementAsBytes = await ctx.stub.getState(this.getCompositeKeyAgreement(key,copyType)); // get the car from chaincode state
       
        if (!agreementAsBytes || agreementAsBytes.length === 0) {
            throw new Error(`${this.getCompositeKeyAgreement(key,copyType)} does not exist`);
        }
        console.log(agreementAsBytes.toString());
        console.info('============= END : queryContract ===========');
        return agreementAsBytes.toString();
    }

    public async singingContract(ctx: Context, key: string,copyType: string, signature: string){
        console.info('============= START : sigingContract ===========');
        const agreementAsBytes = await ctx.stub.getState(this.getCompositeKeyAgreement(key,copyType)); // get the car from chaincode state
       
        if (!agreementAsBytes || agreementAsBytes.length === 0) {
            throw new Error(`${this.getCompositeKeyAgreement(key,copyType)} does not exist`);
        }
        
        const agreement: Agreement = JSON.parse(agreementAsBytes.toString());
        if (agreement.signature !== '') {
            throw new Error("This contract aleardy signed.")
        } 
        agreement.signature = signature;
        await ctx.stub.putState(this.getCompositeKeyAgreement(key,copyType), Buffer.from(JSON.stringify(agreement)));
        console.info('============= END : sigingContract ===========');
    }
}
