class AddDefaultsToTags < ActiveRecord::Migration[5.1]
  def change
    change_column :tags, :word, :string, null: false, unique: true
  end
end
