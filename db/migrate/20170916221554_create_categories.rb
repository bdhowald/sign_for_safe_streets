class CreateCategories < ActiveRecord::Migration[5.1]
  def change
    create_table :categories do |t|
      t.string :word, null: false, unique: true

      t.timestamps
    end
  end
end
