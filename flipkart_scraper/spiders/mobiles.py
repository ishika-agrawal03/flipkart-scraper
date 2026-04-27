import scrapy


class MobilesSpider(scrapy.Spider):
    name = "mobiles"
    allowed_domains = ["flipkart.com"]
    start_urls = ["https://www.flipkart.com/search?q=mobiles"]
   
    page_count=1
    
    def parse(self, response):
        products=response.css("div.jIjQ8S")
        print(f"\nPage Number: {self.page_count} Items: {len(products)}")

        for product in products:
            name=product.css("div.RG5Slk::text").get()
           
            if name:
                price=product.css("div.hZ3P6w::text").get()
                
                if price:
                    price=price.replace("₹","").replace(",","")
                    price=int(price)
                    
            rating=product.css("div.MKiFS6::text").get()
            
            if rating:
                rating=float(rating)
                
            image=product.css("img.UCc1lI::attr(src)").get()

            yield{
                "name": name,
                "price": price,
                "rating":rating,
                "image":image
            }
            
        if self.page_count<5:
            self.page_count +=1
            next_page=f"https://www.flipkart.com/search?q=mobiles&page={self.page_count}"
            yield scrapy.Request(next_page,callback=self.parse)
        