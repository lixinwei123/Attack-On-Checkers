import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CreditsComponent } from './credits.component';

@NgModule({
    imports: [CommonModule, IonicModule],
    declarations: [CreditsComponent],
    entryComponents: [CreditsComponent],
    exports: [CreditsComponent]
})
export class CreditsComponentModule {}
