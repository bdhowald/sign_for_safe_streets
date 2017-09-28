class AddCategoryIdToTags < ActiveRecord::Migration[5.1]
  def change
    add_column :tags, :category_id, :integer, null: false, default: 1
  end
end
