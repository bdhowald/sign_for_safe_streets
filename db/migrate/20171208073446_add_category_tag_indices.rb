class AddCategoryTagIndices < ActiveRecord::Migration[5.1]
  def change
    add_index :categories_tags, [:category_id, :tag_id], :unique => true
    add_index :categories_tags, :tag_id
  end
end
