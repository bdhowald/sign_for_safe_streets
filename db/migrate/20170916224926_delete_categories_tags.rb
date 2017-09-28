class DeleteCategoriesTags < ActiveRecord::Migration[5.1]
  def change
    drop_table :categories_tags
  end
end
