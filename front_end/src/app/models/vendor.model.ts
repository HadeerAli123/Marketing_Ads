export interface Vendor {
  id: string;
  type: string;
  name: string;
  description?: string;
  branch?: string;
  link?: string;
  phone?: string;
  locationLink?: string;
  instagramLink?: string;
  whatsapp?: string;
  facebook?: string;
  snapchat?: string;
    image: string | string[];

  imageUrls: string[];
  campaigns: Campaign[];
  
}

export interface Campaign {
  id: string;
  name: string;
  company_id: string;
  start_date: string;
  end_date: string;
  amount_per_day: number;
  product_ids: string[];
  products?: Product[];
  type?: string;
  company_theme?: string; 
   company?: Company; 
}

export interface CampaignStats {
  date: string;
  visits: number;
  callClicks: number;
  whatsappClicks: number;
  instagramClicks: number;
  facebookClicks: number;
  snapchatClicks: number;
}

export interface Product {
  id: string;
  name: string;
  catgory_name: string;
  company_name: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  phone?: string;
  snapchat?: string;
  image: string | string[];  


  images?: string[];
  description?: string;
  details?: Detail[];
}

export interface Company {
  id: number;
  name: string;
  url: string | null;
  description: string | null;
  logo: string | null;
  phone: string | null;
  company_theme: string | null;
}
export interface Detail {
  product_id: string;
  ads_id: string;
  date: string;
  type: 'whatsapp' | 'phone' | 'facebook' | 'instagram' | 'snapchat' | 'website';
  link: string;
}