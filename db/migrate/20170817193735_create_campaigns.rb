class CreateCampaigns < ActiveRecord::Migration[5.1]
  def change
    create_table :campaigns do |t|
      t.string :name, null: false
      t.string :link, null: false
      t.string :borough, null: false
      t.string :starter, null: false

      t.timestamps
    end
  end
end
