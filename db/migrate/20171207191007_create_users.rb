class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.integer :mixpanel_id
      t.integer :fingerprint_id

      t.timestamps
    end
  end
end
