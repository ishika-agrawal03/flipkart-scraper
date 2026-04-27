# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
import sqlite3
from itemadapter import ItemAdapter


class FlipkartScraperPipeline:
    def open_spider(self,spider):
        self.conn=sqlite3.connect("data.db")
        self.cursor=self.conn.cursor()

        self.cursor.execute(" CREATE TABLE IF NOT EXISTS mobiles(name TEXT, price INTEGER, rating FLOAT,image TEXT)")
        self.cursor.execute("DELETE FROM mobiles")

    def process_item(self, item, spider):
        self.cursor.execute("INSERT INTO mobiles VALUES(?,?,?,?)",
            (
            item.get("name"),
            item.get("price"),
            item.get("rating"),
            item.get("image")))
        
        self.conn.commit()
        return item

    def close_spider(self,spider):

        self.conn.close()