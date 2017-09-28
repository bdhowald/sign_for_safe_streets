class ChangeWordToNameForCategories < ActiveRecord::Migration[5.1]
  def change
    rename_column :categories, :word, :name
  end
end
