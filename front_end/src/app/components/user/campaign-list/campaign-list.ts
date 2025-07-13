import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from './../../../services/campaign';
import { Vendor, Campaign, Company, Detail } from '../../../models/vendor.model';
import { CommonModule } from '@angular/common';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, ConfirmationDialog],
  templateUrl: './campaign-list.html',
  styleUrls: ['./campaign-list.css']
})
export class CampaignList implements OnInit {
  vendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  currentAdId: string | null = null;
  currentType: string | null = null;
  adDetails: Campaign | null = null;
  company: Company | null = null;
  socialDetails: { [vendorId: string]: Detail[] } = {};
  errorMessage: string | null = null;
  socialTypes: Detail['type'][] = ['phone', 'whatsapp', 'instagram', 'facebook', 'snapchat', 'website'];

  constructor(
    private campaignService: CampaignService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentAdId = params.get('adId');
      this.currentType = params.get('type');
      console.log('معرف الإعلان الحالي:', this.currentAdId, 'الثيم:', this.currentType);
      this.loadData();
    });
  }

  loadData() {
    if (this.currentAdId) {
      this.campaignService.getAdDetails(this.currentAdId).subscribe({
        next: (ad) => {
          this.handleAdResponse(ad);
        },
        error: (err) => {
          console.error('خطأ في جلب تفاصيل الإعلان:', err);
          this.adDetails = null;
          this.errorMessage = 'تعذر تحميل تفاصيل الإعلان. حاولي مرة أخرى لاحقًا.';
        }
      });
    } else if (this.currentType) {
      this.campaignService.getAdByTheme(this.currentType).subscribe({
        next: (ad) => {
          this.handleAdResponse(ad);
        },
        error: (err) => {
          console.error(`خطأ في جلب الحملة بالثيم ${this.currentType}:`, err);
          this.adDetails = null;
          this.errorMessage = 'تعذر تحميل الحملة. حاولي مرة أخرى لاحقًا.';
        }
      });
    } else {
      this.errorMessage = 'لم يتم تحديد معرف الإعلان أو الثيم.';
    }
  }

  private handleAdResponse(ad: Campaign | null) {
    this.adDetails = ad;
    console.log('تفاصيل الإعلان:', ad);

    if (ad?.products && Array.isArray(ad.products)) {
     this.vendors = ad.products.map((product: any) => {
  let images: string[] = [];

  if (typeof product.images === 'string') {
    try {
      
      images = product.images.split(',').map((img: string) => img.trim());
    } catch (e) {
      console.error('❌ خطأ في تحويل الصور للمنتج:', product.id, product.images);
      images = [];
    }
  } else if (Array.isArray(product.images)) {
    images = product.images;
  } else if (product.image) {
    if (typeof product.image === 'string') {
      images = product.image.split(',').map((img: string) => img.trim());
    } else if (Array.isArray(product.image)) {
      images = product.image;
    }
  }

  const theme = ad.company_theme || 'unknown';
  const type = this.campaignService.categoryToType[theme] || theme;

  return {
    id: product.id.toString(),
    type: type,
    name: product.name,
    branch: '',
    link: product.link || `/product/${product.id}`,
    phone: product.phone,
    instagramLink: product.instagram,
    facebook: product.facebook,
    snapchat: product.snapchat,
    whatsapp: product.whatsapp,
    image: images,
    imageUrls: images.map((img: string) => `http://127.0.0.1:8000/${img}`),
    campaigns: []
  };
});

  

        

      this.filteredVendors = this.vendors;
      console.log('الفيندورز:', this.vendors);

      this.filteredVendors.forEach((vendor) => {
        this.socialDetails[vendor.id] = [];
        this.campaignService.getSocialDetails(vendor.id).subscribe({
          next: (details) => {
            console.log(` تفاصيل السوشيال للفيندور ${vendor.id}:`, details);
            this.socialDetails[vendor.id] = details;
          },
          error: (err) => {
            console.error(`خطأ في جلب تفاصيل السوشيال للفيندور ${vendor.id}:`, err);
            this.socialDetails[vendor.id] = [];
          }
        });
      });
    } else {
      this.vendors = [];
      this.filteredVendors = [];
      this.errorMessage = 'لا توجد منتجات متاحة لهذا الإعلان.';
    }

 if (ad?.company_id) {
  this.campaignService.getCompany(ad.company_id).subscribe({
    next: (company) => {
      this.company = company;
      console.log(' الشركة:', company);
      if (!company) {
        this.errorMessage = 'تعذر تحميل بيانات الشركة. قد لا تكون الشركة متاحة.';
      }
    },
    error: (err) => {
      console.error('خطأ في جلب الشركة:', err);
      this.company = null;
      this.errorMessage = 'تعذر تحميل بيانات الشركة. حاولي مرة أخرى لاحقًا.';
    }
  });
} else {
  this.company = null;
  this.errorMessage = 'لم يتم تحديد معرف الشركة.';
}
  }


getVendorImage(vendor: Vendor): string {
  if (vendor.imageUrls && vendor.imageUrls.length > 0) {
    console.log(' عرض أول صورة:', vendor.imageUrls[0]);
    return vendor.imageUrls[0];
  }
  return 'assets/default.jpg';
}



  getTheme(type: string): string {
    switch (type) {
      case 'hotel': return 'hotel-theme';
      case 'restaurant': return 'restaurant-theme';
      case 'car_rental': return 'car-theme';
      case 'electronic_stor': return 'electronic-theme';
      case '1': return 'electronic-theme';
      case '2': return 'hotel-theme';
      case '3': return 'car-theme';
      case '4': return 'restaurant-theme';
      default: return 'default-theme';
    }
  }

  getBannerTitle(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'اختر أحدث الأجهزة الإلكترونية';
      case '2': return 'احجز مكانك في أفخم وجهات الرفاهية';
      case '3': return 'استأجر سيارتك المفضلة';
      case '4': return 'استمتع بأشهى المأكولات';
      default: return 'مرحبًا بكم';
    }
  }

  getBannerSubtitle(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'أحدث الإلكترونيات بأفضل الأسعار في مكان واحد';
      case '2': return 'استمتع بعروض حصرية وتجارب لا تُنسى';
      case '3': return 'قيادة مريحة بأفضل الأسعار';
      case '4': return 'عروض مميزة لجميع الأذواق';
      default: return 'استكشف عروضنا';
    }
  }

  getRoomsTitle(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'اجهزة كهربائية';
      case '2': return 'الغرف والأجنحة';
      case '3': return 'السيارات المتاحة';
      case '4': return 'القوائم والعروض';
      default: return '';
    }
  }

  getMainTitle(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'أجهزة إلكترونية ومنزلية بجودة عالية وأسعار منافسة';
      case '2': return 'فنادق في الكويت بخدمات مميزة';
      case '3': return 'إيجار سيارات في الرياض بأفضل العروض';
      case '4': return 'مطاعم في الكويت بأشهى الأطباق';
      default: return '';
    }
  }

  getFooterTitle(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'أفضل الأجهزة الإلكترونية والمنزلية';
      case '2': return 'فنادق ومنتجعات الرفاهية';
      case '3': return 'إيجار سيارات فاخرة';
      case '4': return 'مطاعم ومقاهي الفخامة';
      default: return '';
    }
  }

  getFooterImage(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'assets/footerx-.png';
      case '2': return 'assets/footer-image-Photoroom.png';
      case '3': return 'assets/footer.png';
      case '4': return 'assets/footer-image (2).png';
      default: return 'assets/hotelphoto (1).jpg';
    }
  }

  getBannerImage(): string {
    switch (this.adDetails?.company_theme) {
      case '1': return 'assets/Capture-Photoroom_LE_up.jpg';
      case '2': return 'assets/hotelphoto (1).jpg';
      case '3': return 'assets/rent-a-car.avif';
      case '4': return 'assets/DSCF1069.jpg';
      default: return 'assets/hotelphoto (1).jpg';
    }
  }

  shouldShow(type: Detail['type'], vendor: Vendor): boolean {
    const details = this.socialDetails[vendor.id] || [];
    const hasTypeInDetails = details.some((detail) => detail.type === type);
    const hasLink = !!this.getSocialLink(type, vendor);
    console.log(`الفيندور ${vendor.id}, النوع ${type}: hasTypeInDetails=${hasTypeInDetails}, hasLink=${hasLink}`);
    return hasTypeInDetails && hasLink;
  }

  getSocialLink(type: Detail['type'], vendor: Vendor): string | undefined {
    switch (type) {
      case 'phone': return vendor.phone;
      case 'whatsapp': return vendor.whatsapp;
      case 'instagram': return vendor.instagramLink;
      case 'facebook': return vendor.facebook;
      case 'snapchat': return vendor.snapchat;
      case 'website': return vendor.link;
      default: return undefined;
    }
  }

  handleSocialClick(vendor: Vendor, type: Detail['type']) {
    const productId = vendor.id;
    const link = this.getSocialLink(type, vendor);

    if (!link) {
      console.error(`مفيش رابط للنوع ${type} في الفيندور ${vendor.id}`);
      return;
    }

    if (type === 'phone' || type === 'whatsapp') {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '250px',
        data: { message: `Open ${type === 'phone' ? 'Call' : 'WhatsApp'}?`, action: type, phone: link },
        id: `${type}-confirmation-dialog`
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'open') {
          if (type === 'phone') {
            window.location.href = `tel:${link}`;
          } else if (type === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?phone=${link}`, '_blank');
          }
          this.campaignService.trackClick(type, productId);
        }
      });
    } else {
      window.open(link, '_blank');
      this.campaignService.trackClick(type, productId);
    }
  }

goToDetails(productId: string, type: string) {
  const socialDetailsForVendor = this.socialDetails[productId] || [];
  const vendor = this.vendors.find(v => v.id === productId);

  this.router.navigate(['/product', productId], {
    queryParams: { type },
    state: {
      socialDetails: socialDetailsForVendor,
      product: vendor  
    }
  });
}



  getIconClass(type: Detail['type']): string {
    switch (type) {
      case 'whatsapp': return 'fab fa-whatsapp';
      case 'phone': return 'fas fa-phone';
      case 'instagram': return 'fab fa-instagram';
      case 'facebook': return 'fab fa-facebook-f';
      case 'snapchat': return 'fab fa-snapchat';
      case 'website': return 'fas fa-globe';
      default: return 'fas fa-share-alt';
    }
  }
}