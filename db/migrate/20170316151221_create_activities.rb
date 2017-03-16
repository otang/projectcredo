class CreateActivities < ActiveRecord::Migration[5.0]
  def change
    create_table :activities do |t|
      t.integer :user_id
      t.string :activity_type
      t.integer :reference_id
      t.string :actable_type
      t.integer :actable_id

      t.timestamps
    end

    add_index  :activities, [:activity_type, :user_id]
    add_index  :activities, [:actable_type, :actable_id]
    add_index  :activities, [:user_id, :actable_id, :reference_id]
  end
end
