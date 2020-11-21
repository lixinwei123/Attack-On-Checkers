import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AboutComponent } from './about.component';

@NgModule({
    imports: [CommonModule, IonicModule],
    declarations: [AboutComponent],
    entryComponents: [AboutComponent],
    exports: [AboutComponent]
})
export class AboutComponentModule { }
