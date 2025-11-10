import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class APPCOMMONHELPERS {

    static numberOnly(event): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    static numberanddotOnly(event): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode == 46) {
            return true;
        }
        else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    static roundTo(num: number, places: number) {
        const factor = 10 ** places;
        return Math.round(num * factor) / factor;
    };
}
