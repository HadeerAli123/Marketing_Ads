import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendor, Campaign, CampaignStats, Product, Company, Detail } from '../models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = 'http://127.0.0.1:8000';
  private stats: { [id: string]: CampaignStats[] } = {};

  private _categoryToType: { [key: string]: string } = {
    '1': 'electronic_stor',
    '2': 'hotel',
    '3': 'car_rental',
    '4': 'restaurant'
  };

  constructor(private http: HttpClient) {}

  public get apiUrlValue(): string {
    return this.apiUrl;
  }

  getVendors(): Observable<Vendor[]> {
    return this.http.get(`${this.apiUrl}/api/product`).pipe(
      map((response: any) => {
        if (!response || !Array.isArray(response.data)) return [];
        const vendors: Vendor[] = [];
        response.data.forEach((ad: any) => {
          if (ad.products && Array.isArray(ad.products)) {
            ad.products.forEach((product: any) => {
              const categoryId = product.company_theme || '';
              const type = this._categoryToType[categoryId] || 'unknown';
              vendors.push({
                id: product.id.toString(),
                type,
                name: product.name,
                branch: '',
                link: product.link || `/product/${product.id}`,
                phone: product.phone,
                instagramLink: product.instagram,
                facebook: product.facebook,
                snapchat: product.snapchat,
                whatsapp: product.whatsapp,
                image: product.image,
imageUrls: product.image ? product.image.map((img: string) => `${this.apiUrl}/${img}`) : [],

                campaigns: []
              });
            });
          }
        });
        console.log('✅ الفيندورز المعالجين:', vendors);
        return vendors;
      }),
      catchError(err => {
        console.error('خطأ في جلب المنتجات:', err);
        return of([]);
      })
    );
  }

  getSocialDetails(productId: string): Observable<Detail[]> {
    return this.http.get<any>(`${this.apiUrl}/api/details?product_id=${productId}`).pipe(
      map(res => {
        let details: Detail[] = [];
        if (res.data && Array.isArray(res.data)) {
          res.data.forEach((ad: any) => {
            if (ad.products && Array.isArray(ad.products)) {
              ad.products.forEach((product: any) => {
                if (product.id.toString() === productId && product.details && Array.isArray(product.details)) {
                  details = product.details.map((detail: any) => ({
                    product_id: detail.product_id,
                    ads_id: detail.ads_id,
                    date: detail.date,
                    type: detail.type,
                    link: this.getLinkFromVendor(detail.type, product)
                  }));
                }
              });
            }
          });
        }
        console.log(`تفاصيل السوشيال المعالجة للمنتج ${productId}:`, details);
        return details;
      }),
      catchError(err => {
        console.error(`خطأ في جلب تفاصيل السوشيال للمنتج ${productId}:`, err);
        return of([]);
      })
    );
  }

  private getLinkFromVendor(type: Detail['type'], product: any): string | undefined {
    switch (type) {
      case 'phone': return product.phone;
      case 'whatsapp': return product.whatsapp;
      case 'instagram': return product.instagram;
      case 'facebook': return product.facebook;
      case 'snapchat': return product.snapchat;
      case 'website': return product.link;
      default: return undefined;
    }
  }

  getAdDetails(adId: string): Observable<Campaign | null> {
    return this.http.get(`${this.apiUrl}/api/ads/${adId}`).pipe(
      map((response: any) => {
        console.log(`رد الـ API /api/ads/${adId}:`, response);
        const ad = response.data;
        if (!ad) {
          console.error('مفيش بيانات إعلان في الرد:', response);
          return null;
        }

        return {
          id: ad.id.toString(),
          name: ad.name,
          company_id: ad.company_id.toString(),
          start_date: ad.start_date,
          end_date: ad.end_date,
          amount_per_day: parseFloat(ad.amount_per_day),
          product_ids: JSON.parse(ad.product_ids || '[]'),
          products: ad.products || [],
          company_theme: ad.company_theme?.toString(),
          type: this._categoryToType[ad.company_theme] || 'unknown'
        } as Campaign;
      }),
      catchError(err => {
        console.error(`خطأ في جلب تفاصيل الإعلان ${adId}:`, err);
        return of(null);
      })
    );
  }

getCompany(id: string | number): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/company/${id}`);
}


  getAdByTheme(themeType: string): Observable<Campaign | null> {
    return this.http.get(`${this.apiUrl}/api/ads`).pipe(
      map((response: any) => {
        console.log('رد الـ API /api/ads:', response);
        const ads = response.data || [];
        const themeId = this.getThemeIdFromType(themeType);
        const matchedAd = ads.find((ad: any) => ad.company_theme?.toString() === themeId);

        if (!matchedAd) {
          console.error(`مفيش إعلان بالثيم ${themeType}`);
          return null;
        }

        return {
          id: matchedAd.id.toString(),
          name: matchedAd.name,
          company_id: matchedAd.company_id.toString(),
          start_date: matchedAd.start_date,
          end_date: matchedAd.end_date,
          amount_per_day: parseFloat(matchedAd.amount_per_day),
          product_ids: JSON.parse(matchedAd.product_ids || '[]'),
          products: matchedAd.products || [],
          company_theme: matchedAd.company_theme?.toString(),
          type: this._categoryToType[matchedAd.company_theme] || 'unknown'
        } as Campaign;
      }),
      catchError(err => {
        console.error(`خطأ في جلب الحملات بالثيم ${themeType}:`, err);
        return of(null);
      })
    );
  }

  private getThemeIdFromType(type: string): string {
    const map: { [key: string]: string } = {
      'electronic_stor': '1',
      'hotel': '2',
      'car_rental': '3',
      'restaurant': '4'
    };
    return map[type] || '';
  }

  getAllAds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/ads`);
  }

  trackClick(type: string, productId: string) {
    const date = new Date().toISOString().split('T')[0];
    if (!this.stats[productId]) {
      this.stats[productId] = [{
        date,
        visits: 0,
        callClicks: 0,
        whatsappClicks: 0,
        instagramClicks: 0,
        facebookClicks: 0,
        snapchatClicks: 0
      }];
    }

    let stat = this.stats[productId].find(s => s.date === date);
    if (!stat) {
      stat = {
        date,
        visits: 0,
        callClicks: 0,
        whatsappClicks: 0,
        instagramClicks: 0,
        facebookClicks: 0,
        snapchatClicks: 0
      };
      this.stats[productId].push(stat);
    }

    if (type === 'call') stat.callClicks++;
    if (type === 'whatsapp') stat.whatsappClicks++;
    if (type === 'instagram') stat.instagramClicks++;
    if (type === 'facebook') stat.facebookClicks++;
    if (type === 'snapchat') stat.snapchatClicks++;
    if (type === 'website') stat.visits++;

    this.http.post(`${this.apiUrl}/api/details`, {
      product_id: productId,
      type,
      date
    }).subscribe({
      error: err => console.error('خطأ في تتبع النقرة:', err)
    });
  }

  trackVisit(productId: string) {
    const date = new Date().toISOString().split('T')[0];
    if (!this.stats[productId]) {
      this.stats[productId] = [{
        date,
        visits: 0,
        callClicks: 0,
        whatsappClicks: 0,
        instagramClicks: 0,
        facebookClicks: 0,
        snapchatClicks: 0
      }];
    }

    let stat = this.stats[productId].find(s => s.date === date);
    if (!stat) {
      stat = {
        date,
        visits: 0,
        callClicks: 0,
        whatsappClicks: 0,
        instagramClicks: 0,
        facebookClicks: 0,
        snapchatClicks: 0
      };
      this.stats[productId].push(stat);
    }

    stat.visits++;
  }

  getProductById(id: string): Observable<Vendor | null> {
  return this.http.get(`${this.apiUrl}/api/product/${id}`).pipe(
    map((response: any) => {
      const product = response.data;
      if (!product) return null;

      const categoryId = product.company_theme || '';
      const type = this._categoryToType[categoryId] || 'unknown';

      let images: string[] = [];

      if (Array.isArray(product.image)) {
        images = product.image;
      } else if (typeof product.image === 'string') {
        images = product.image.split(',').map((img: string) => img.trim());
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }

      return {
        id: product.id.toString(),
        type,
        name: product.name,
        description: product.description,
        branch: '',
        link: product.link || `/product/${product.id}`,
        phone: product.phone,
        instagramLink: product.instagram,
        facebook: product.facebook,
        snapchat: product.snapchat,
        whatsapp: product.whatsapp,
        locationLink: product.link,
        image: images,
       imageUrls: images.map((img: string) => `${this.apiUrl}/${img}`),

        campaigns: []
      } as Vendor;
    }),
    catchError(err => {
      console.error('خطأ في جلب المنتج:', err);
      return of(null);
    })
  );
}

  

  public get categoryToType(): { [key: string]: string } {
    return this._categoryToType;
  }
}