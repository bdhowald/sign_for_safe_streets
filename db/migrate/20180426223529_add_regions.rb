class AddRegions < ActiveRecord::Migration[5.1]
  def change
    create_table :regions do |t|
      t.string :name, null: false, unique: true
      t.string :alias, unique: true

      t.timestamps
    end

    create_join_table :regions, :campaigns
  end
end