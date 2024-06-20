const moment = require("moment");
const db = require("../db");


class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  static async get(id) {
    const result = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt",
           notes
         FROM reservations 
         WHERE id = $1`,
      [id]
    );

    let reservation = result.rows[0];

    if (reservation === undefined) {
      const err = new Error(`Reservation ${id} does not exist.`);
      err.status = 404;
      throw err;
    }

    return new Reservation(reservation);
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
             WHERE id=$4`,
        [this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
  
  set customerId(val) {
    if (this._customerId && this._customerId !== val)
      throw new Error("Cannot change customer ID");
    this._customerId = val;
  }

  get customerId() {
    return this._customerId;
  }

  get numGuests() {
    return this._numGuests;
  }

  set numGuests(val) {
    if (val < 1) throw new Error("Must have at least 1 guest");
    this._numGuests = val;
  }

  get startAt() {
    return this._startAt;
  }

  set startAt(val) {
    if (val instanceof Date && !isNaN(val)) this._startAt = val;
    else throw new Error("Invalid startAt");
  }

  get formattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  get notes() {
    return this._notes;
  }

  set notes(val) {
    this._notes = val || "";
  }
}

module.exports = Reservation;
