import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CampaignService } from './../../../services/campaign';
import { ConfirmationDialog } from './../../user/confirmation-dialog/confirmation-dialog';
import { Vendor, Detail } from '../../../models/vendor.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, ConfirmationDialog, HttpClientModule],
  templateUrl: './campaign-detail.html',
  styleUrls: ['./campaign-detail.css']
})
export class CampaignDetail implements OnInit {
  product: Vendor | undefined;
  theme: string = '';
  currentSlide: number = 0;
  currentType: string | null = null;
  availableDetailTypes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    public dialog: MatDialog
  ) {}
ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  this.currentType = this.route.snapshot.queryParams['type'];

  const passedDetails = history.state['socialDetails'] as Detail[] | undefined;
  const passedProduct = history.state['product'] as Vendor | undefined;

  if (passedDetails && passedDetails.length) {
    this.availableDetailTypes = passedDetails.map(detail => detail.type);
  }

  if (passedProduct) {
    this.product = passedProduct;
    this.theme = this.getTheme(passedProduct.type);

   
    if (passedProduct.imageUrls?.length) {
      setInterval(() => this.autoNextSlide(), 4000);
    }

    return;
  }
if (id) {
  this.campaignService.trackVisit(id);
  this.campaignService.getProductById(id).subscribe(product => {
    if (product) {
      this.product = product;

      const baseUrl = 'http://127.0.0.1:8000';
      let images: string[] = [];

      if (typeof product.image === 'string') {
        images = product.image.split(',').map((img: string) => img.trim());
      } else if (Array.isArray(product.image)) {
        images = product.image;
      } else {
        images = [];
      }

     this.product.imageUrls = images.map((img: string) =>
  img.startsWith('http') ? img : `${baseUrl}/${img}`
);

    


      if (this.product.imageUrls?.length) {
        setInterval(() => this.autoNextSlide(), 4000);
      }
    }
  });
}

  this.theme = this.getTheme(this.currentType);
}

  autoNextSlide() {
    if (!this.product?.imageUrls?.length) return;
    this.currentSlide = (this.currentSlide + 1) % this.product.imageUrls.length;
  }

  nextSlide() {
    if (!this.product?.imageUrls?.length) return;
    this.currentSlide = (this.currentSlide + 1) % this.product.imageUrls.length;
  }

  prevSlide() {
    if (!this.product?.imageUrls?.length) return;
    this.currentSlide =
      (this.currentSlide - 1 + this.product.imageUrls.length) % this.product.imageUrls.length;
  }

  openCall() {
    if (this.product?.phone && this.product?.id) {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '250px',
        data: { message: 'Open Call?', action: 'call', phone: this.product.phone },
        id: 'call-confirmation-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'open') {
          window.location.href = `tel:${this.product!.phone}`;
          this.campaignService.trackClick('call', this.product!.id);
        }
      });
    }
  }

  openWhatsapp() {
    if (this.product?.whatsapp && this.product?.id) {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '250px',
        data: { message: 'Open WhatsApp?', action: 'whatsapp', phone: this.product.whatsapp },
        id: 'whatsapp-confirmation-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'open') {
          window.open(`https://api.whatsapp.com/send?phone=${this.product!.whatsapp}`, '_blank');
          this.campaignService.trackClick('whatsapp', this.product!.id);
        }
      });
    }
  }

  openInstagram() {
    if (this.product?.instagramLink && this.product?.id) {
      window.open(this.product.instagramLink, '_blank');
      this.campaignService.trackClick('instagram', this.product!.id);
    }
  }

  openLocation() {
    if (this.product?.locationLink && this.product?.id) {
      window.open(this.product.locationLink, '_blank');
      this.campaignService.trackClick('location', this.product!.id);
    }
  }

  getTheme(type: string | null): string {
    switch (type) {
      case 'hotel': return 'hotel-theme';
      case 'restaurant': return 'restaurant-theme';
      case 'car_rental': return 'car-theme';
      case 'electronic_stor': return 'electronic_stor';
      default: return '';
    }
  }

  getFooterTitle(): string {
    switch (this.currentType) {
      case 'hotel': return 'فنادق ومنتجعات الرفاهية';
      case 'restaurant': return 'مطاعم ومقاهي الفخامة';
      case 'car_rental': return 'إيجار سيارات فاخرة';
      case 'electronic_stor': return 'أفضل الأجهزة الإلكترونية والمنزلية';
      default: return '';
    }
  }

  getFooterImage(): string {
    switch (this.currentType) {
      case 'hotel': return 'assets/footer-image-Photoroom.png';
      case 'restaurant': return 'assets/footer-image (2).png';
      case 'car_rental': return 'assets/footer.png';
      case 'electronic_stor': return 'assets/footerx-.png';
      default: return 'assets/hotelphoto (1).jpg';
    }
  }
}
