class ChangeTagsToHasAndBelongsToManyCategories < ActiveRecord::Migration[5.1]
  def change
    create_table :categories_tags, :id => false do |t|
      t.integer :category_id
      t.integer :tag_id
    end

    remove_column :tags, :category_id
  end
end
