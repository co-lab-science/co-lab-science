class CreateTags < ActiveRecord::Migration[5.0]
  def change
    create_table :tags do |t|
      t.integer :lab_id
      t.string :name

      t.timestamps
    end
  end
end