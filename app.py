


from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pymysql
from datetime import datetime, date, time
import io
import pandas as pd
from decimal import Decimal
from fuzzywuzzy import fuzz 
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'medingen'

def get_mysql_connection():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB'],
        cursorclass=pymysql.cursors.DictCursor
    )

def serialize_value(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    elif isinstance(value, time):
        return value.strftime('%H:%M:%S')
    elif isinstance(value, Decimal):
        return float(value)
    return value

def serialize_product(product):
    if not product:
        return None
    return {key: serialize_value(value) for key, value in product.items()}

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        connection = get_mysql_connection()
        connection.close()
        return jsonify({'status': 'ok', 'message': 'Server and database connection are working'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products ORDER BY product_id DESC")
            products = cursor.fetchall()
        connection.close()
        
        serialized_products = [serialize_product(product) for product in products]
        
        return jsonify({
            'success': True,
            'data': serialized_products,
            'count': len(serialized_products)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
            product = cursor.fetchone()
        connection.close()
        
        if not product:
            return jsonify({'success': False, 'error': 'Product not found'}), 200
        
        return jsonify({
            'success': True,
            'data': serialize_product(product)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    try:
        data = request.get_json()
        connection = get_mysql_connection()
        
        fields = []
        values = []
        placeholders = []
        
        field_mapping = {
            'product_type': data.get('product_type'),
            'name': data.get('name'),
            'salt_name': data.get('salt_name'),
            'composition': data.get('composition'),
            'manufacturer': data.get('manufacturer'),
            'consume_type': data.get('consume_type'),
            'composition_code': data.get('composition_code', ''),
            'schedule_category': data.get('schedule_category', ''),
            'marketed_by': data.get('marketed_by', ''),
            'used_for': data.get('used_for', ''),
            'expiry': data.get('expiry'),
            'manufacture_date': data.get('manufacture_date'),
            'photo': data.get('photo'),
            'faq': data.get('faq'),
            'related_product_ids': data.get('related_product_ids'),
            'quantity_available': data.get('quantity_available'),
            'rack_id': data.get('rack_id'),
            'department_id': data.get('department_id'),
            'long_description': data.get('long_description'),
            'product_pricing_old': data.get('product_pricing_old'),
            'product_pricing_new': data.get('product_pricing_new'),
            'product_coupon_code': data.get('product_coupon_code'),
            'visibility_status': data.get('visibility_status'),
            'variant': data.get('variant'),
            'tags': data.get('tags'),
            'categories': data.get('categories'),
            'inventory_info_sku': data.get('inventory_info_sku'),
            'inventory_info_total_stock': data.get('inventory_info_total_stock'),
            'inventory_info_supplier_id': data.get('inventory_info_supplier_id'),
            'page_title': data.get('page_title'),
            'product_url_id': data.get('product_url_id'),
            'available_for_states': data.get('available_for_states'),
            'prescription_required': data.get('prescription_required'),
            'reward_points_mig_coins': data.get('reward_points_mig_coins'),
            'publish_date': data.get('publish_date'),
            'publish_time': data.get('publish_time'),
            'created_by': data.get('created_by'),
            'images': data.get('images'),
            'selected_category': data.get('selected_category'),
            'medicine_href': data.get('medicine_href', ''),
            'packaging': data.get('packaging'),
            'rc': data.get('rc', 0),
            'meta_keywords': data.get('meta_keywords', ''),
            'meta_title': data.get('meta_title', ''),
            'meta_description': data.get('meta_description', ''),
            'product_name_url': data.get('product_name_url', ''),
            'formulation': data.get('formulation', '')
        }
        
        for field, value in field_mapping.items():
            if value is not None:
                fields.append(field)
                values.append(value)
                placeholders.append('%s')
        
        if not fields:
            return jsonify({'success': False, 'error': 'No valid fields provided'}), 400
        
        query = f"INSERT INTO products ({', '.join(fields)}) VALUES ({', '.join(placeholders)})"
        
        with connection.cursor() as cursor:
            cursor.execute(query, values)
            connection.commit()
            product_id = cursor.lastrowid
        
        connection.close()
        
        return jsonify({
            'success': True,
            'message': 'Product created successfully',
            'product_id': product_id
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.get_json()
        connection = get_mysql_connection()
        
        updates = []
        values = []
        
        field_mapping = {
            'product_type': data.get('product_type'),
            'name': data.get('name'),
            'rc_pharam_product_name': data.get('rc_pharam_product_name'),
            'salt_name': data.get('salt_name'),
            'composition': data.get('composition'),
            'manufacturer': data.get('manufacturer'),
            'consume_type': data.get('consume_type'),
            'composition_code': data.get('composition_code'),
            'schedule_category': data.get('schedule_category'),
            'marketed_by': data.get('marketed_by'),
            'used_for': data.get('used_for'),
            'expiry': data.get('expiry'),
            'manufacture_date': data.get('manufacture_date'),
            'photo': data.get('photo'),
            'faq': data.get('faq'),
            'related_product_ids': data.get('related_product_ids'),
            'product_entry_updated_date': datetime.now(),
            'quantity_available': data.get('quantity_available'),
            'rack_id': data.get('rack_id'),
            'department_id': data.get('department_id'),
            'long_description': data.get('long_description'),
            'product_pricing_old': data.get('product_pricing_old'),
            'product_pricing_new': data.get('product_pricing_new'),
            'product_coupon_code': data.get('product_coupon_code'),
            'visibility_status': data.get('visibility_status'),
            'variant': data.get('variant'),
            'tags': data.get('tags'),
            'categories': data.get('categories'),
            'inventory_info_sku': data.get('inventory_info_sku'),
            'inventory_info_total_stock': data.get('inventory_info_total_stock'),
            'inventory_info_supplier_id': data.get('inventory_info_supplier_id'),
            'page_title': data.get('page_title'),
            'product_url_id': data.get('product_url_id'),
            'available_for_states': data.get('available_for_states'),
            'prescription_required': data.get('prescription_required'),
            'reward_points_mig_coins': data.get('reward_points_mig_coins'),
            'publish_date': data.get('publish_date'),
            'publish_time': data.get('publish_time'),
            'created_by': data.get('created_by'),
            'images': data.get('images'),
            'selected_category': data.get('selected_category'),
            'medicine_href': data.get('medicine_href'),
            'packaging': data.get('packaging'),
            'rc': data.get('rc'),
            'meta_keywords': data.get('meta_keywords'),
            'meta_title': data.get('meta_title'),
            'meta_description': data.get('meta_description'),
            'product_name_url': data.get('product_name_url'),
            'formulation': data.get('formulation')
        }
        
        for field, value in field_mapping.items():
            if value is not None:
                updates.append(f"{field} = %s")
                values.append(value)
        
        if not updates:
            return jsonify({'success': False, 'error': 'No valid fields to update'}), 400
        
        values.append(product_id)
        query = f"UPDATE products SET {', '.join(updates)} WHERE product_id = %s"
        
        with connection.cursor() as cursor:
            cursor.execute(query, values)
            connection.commit()
            affected_rows = cursor.rowcount
        
        connection.close()
        
        if affected_rows == 0:
            return jsonify({'success': False, 'error': 'Product not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Product updated successfully'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        connection = get_mysql_connection()
        
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
            connection.commit()
            affected_rows = cursor.rowcount
        
        connection.close()
        
        if affected_rows == 0:
            return jsonify({'success': False, 'error': 'Product not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/export', methods=['GET'])
def export_products():
    try:
        connection = get_mysql_connection()
        
        query = "SELECT * FROM products ORDER BY product_id DESC"
        df = pd.read_sql(query, connection)
        connection.close()
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Products')
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'products_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/search', methods=['GET'])
def search_products():
    try:
        search_term = request.args.get('q', '')
        
        if not search_term:
            return jsonify({'success': False, 'error': 'Search term required'}), 400
        
        connection = get_mysql_connection()
        
        with connection.cursor() as cursor:
            query = """
                SELECT * FROM products 
                WHERE name LIKE %s 
                OR salt_name LIKE %s 
                OR manufacturer LIKE %s
                OR composition LIKE %s
                ORDER BY product_id DESC
            """
            search_pattern = f"%{search_term}%"
            cursor.execute(query, (search_pattern, search_pattern, search_pattern, search_pattern))
            products = cursor.fetchall()
        
        connection.close()
        
        serialized_products = [serialize_product(product) for product in products]
        
        return jsonify({
            'success': True,
            'data': serialized_products,
            'count': len(serialized_products)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/upload-excel', methods=['POST'])
def upload_excel():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'success': False, 'error': 'Invalid file type. Please upload Excel file'}), 400
        
        excel_file = pd.ExcelFile(file)
        all_products = []
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            df.columns = df.columns.str.strip()
            
            brand_col = None
            for col in df.columns:
                if 'BRAND' in col.upper() or 'NAME' in col.upper():
                    brand_col = col
                    break
            
            if not brand_col:
                continue
            
            for idx, row in df.iterrows():
                product_name = str(row[brand_col]).strip() if pd.notna(row[brand_col]) else ''
                if product_name and product_name.lower() != 'nan':
                    product_data = {
                        'sheet_name': sheet_name,
                        'row_number': idx + 2, 
                        'brand_name': product_name,
                        'generic_name': str(row.get('GENERIC NAME', '')).strip() if 'GENERIC NAME' in df.columns else '',
                        'packing': str(row.get('PACKING', '')).strip() if 'PACKING' in df.columns else '',
                        'manufacturer': str(row.get('MFR', '')).strip() if 'MFR' in df.columns else '',
                        'billing_rate': str(row.get('BILLING RATE', '')).strip() if 'BILLING RATE' in df.columns else '',
                        'mrp': str(row.get('MRP', '')).strip() if 'MRP' in df.columns else '',
                        'qty_required': str(row.get('QTY REQUIRED', '')).strip() if 'QTY REQUIRED' in df.columns else ''
                    }
                    all_products.append(product_data)
        
        return jsonify({
            'success': True,
            'data': all_products,
            'count': len(all_products),
            'sheets_processed': len(excel_file.sheet_names)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/find-matches', methods=['POST'])
def find_matches():
    try:
        data = request.get_json()
        search_term = str(data.get('search_term', data.get('product_name', ''))).strip()
        excel_generic_name = str(data.get('generic_name', '')).strip()
        excel_brand_name = str(data.get('excel_brand_name', '')).strip()
        
        if not search_term:
            return jsonify({'success': False, 'error': 'Search term required'}), 400
        
        connection = get_mysql_connection()
        matches = []
        
        with connection.cursor() as cursor:
            # Robust Word-based Search
            search_words = [w.strip() for w in search_term.replace('-', ' ').split() if len(w.strip()) > 1]
            if not search_words:
                search_words = [search_term] # Fallback
            
            # Construct a flexible query that searches for products containing these words
            # We'll prioritize products matching more words
            conditions = []
            params = []
            for word in search_words:
                pattern = f"%{word}%"
                conditions.append("(name LIKE %s OR rc_pharam_product_name LIKE %s OR composition LIKE %s OR salt_name LIKE %s)")
                params.extend([pattern, pattern, pattern, pattern])
            
            # Use OR to find anything relevant, then we'll rank by word match count
            query = f"""
                SELECT product_id, name, rc_pharam_product_name, composition, salt_name, manufacturer, product_pricing_new, inStock 
                FROM products 
                WHERE {" OR ".join(conditions)}
                LIMIT 200
            """
            cursor.execute(query, params)
            db_results = cursor.fetchall()
            
            for p in db_results:
                db_composition = str(p.get('composition') or '').strip()
                db_name = str(p.get('name') or '').strip()
                db_rc_name = str(p.get('rc_pharam_product_name') or '').strip()
                db_salt = str(p.get('salt_name') or '').strip()
                
                # Restore match_count calculation
                match_count = 0
                searchable_text = f"{db_name} {db_rc_name} {db_composition} {db_salt}".lower()
                for word in search_words:
                    if word.lower() in searchable_text:
                        match_count += 1
                
                matches.append({
                    'product_id': p['product_id'],
                    'name': p['name'],
                    'rc_pharam_product_name': p['rc_pharam_product_name'],
                    'composition': p['composition'],
                    'salt_name': p['salt_name'],
                    'manufacturer': p['manufacturer'],
                    'price': float(p['product_pricing_new']) if p['product_pricing_new'] else None,
                    'match_score': match_count,
                    'match_type': "Match",
                    'inStock': bool(p.get('inStock', False))
                })
        
        connection.close()
        
        # Sort by match count (descending), then name
        matches.sort(key=lambda x: (-x['match_score'], x['name']))
        
        return jsonify({
            'success': True,
            'data': matches,
            'count': len(matches)
        }), 200
        
    except Exception as e:
        if 'connection' in locals() and connection:
            connection.close()
        return jsonify({'success': False, 'error': str(e)}), 500
        
    except Exception as e:
        if 'connection' in locals() and connection:
            connection.close()
        return jsonify({'success': False, 'error': str(e)}), 500

        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/products/approve-match', methods=['POST'])
def approve_match():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        rc_product_name = str(data.get('rc_product_name', '')).strip()

        if product_id:
            connection = get_mysql_connection()
            with connection.cursor() as cursor:
                # Update rc_pharam_product_name and set inStock = TRUE
                cursor.execute(
                    "UPDATE products SET rc_pharam_product_name = %s, inStock = TRUE WHERE product_id = %s",
                    (rc_product_name, product_id)
                )
                connection.commit()
                affected_rows = cursor.rowcount

            connection.close()

            if affected_rows == 0:
                return jsonify({'success': False, 'error': 'Product not found'}), 200

            return jsonify({
                'success': True,
                'message': 'Match approved and saved successfully',
                'action': 'updated'
            }), 200
        else:
            # Create a new product when product_id is not provided
            brand_name = str(data.get('brand_name', '')).strip()
            generic_name = str(data.get('generic_name', '')).strip()
            manufacturer = str(data.get('manufacturer', '')).strip()
            packing = str(data.get('packing', '')).strip()

            if not brand_name:
                return jsonify({'success': False, 'error': 'brand_name is required to create a new product'}), 400

            connection = get_mysql_connection()
            with connection.cursor() as cursor:
                try:
                    cursor.execute("""
                        ALTER TABLE products 
                        ADD COLUMN inStock BOOLEAN DEFAULT FALSE
                    """)
                    connection.commit()
                except Exception:
                    pass

                cursor.execute("""
                    INSERT INTO products (
                        name, 
                        composition, 
                        manufacturer, 
                        packaging,
                        rc_pharam_product_name,
                        inStock,
                        product_entry_created_date
                    ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    brand_name,
                    generic_name,
                    manufacturer,
                    packing,
                    rc_product_name,
                    True
                ))

                connection.commit()
                new_product_id = cursor.lastrowid

            connection.close()

            return jsonify({
                'success': True,
                'message': 'New product created successfully',
                'action': 'created',
                'product_id': new_product_id
            }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/products/unmatch', methods=['POST'])
def unmatch_product():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        
        if not product_id:
            return jsonify({'success': False, 'error': 'Product ID is required'}), 400
            
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            # Set rc_pharam_product_name to NULL and inStock to FALSE
            cursor.execute("""
                UPDATE products 
                SET rc_pharam_product_name = NULL,
                    inStock = FALSE
                WHERE product_id = %s
            """, (product_id,))
            connection.commit()
            
        connection.close()
        return jsonify({'success': True, 'message': 'Product unmatched successfully'}), 200
        
    except Exception as e:
        if 'connection' in locals() and connection:
            connection.close()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/products/match-stock', methods=['POST'])
def match_stock():
    try:
        data = request.get_json()
        new_products = data.get('products', [])
        
        if not new_products:
            return jsonify({'success': False, 'error': 'No products provided'}), 400
        
        connection = get_mysql_connection()
        
        # Optimized: Fetch all relevant DB products once for in-memory matching
        with connection.cursor() as cursor:
            cursor.execute("SELECT product_id, name, composition, rc_pharam_product_name, inStock FROM products")
            db_all = cursor.fetchall()
        
        # Create lookup dictionaries for fast access
        # Primary lookup: (brand_name, composition)
        # Secondary lookup: (brand_name) - fallback
        lookup_full = {}
        lookup_name_only = {}
        
        for p in db_all:
            name_lower = str(p['name'] or '').strip().lower()
            rc_name_lower = str(p['rc_pharam_product_name'] or '').strip().lower()
            comp_lower = str(p['composition'] or '').strip().lower()
            
            # Add to full lookup (both name and rc_name)
            if comp_lower:
                if name_lower: lookup_full[(name_lower, comp_lower)] = p
                if rc_name_lower: lookup_full[(rc_name_lower, comp_lower)] = p
            
            # Add to name-only lookup (both name and rc_name)
            if name_lower and name_lower not in lookup_name_only:
                lookup_name_only[name_lower] = p
            if rc_name_lower and rc_name_lower not in lookup_name_only:
                lookup_name_only[rc_name_lower] = p
        
        matched_products = []
        unmatched_products = []
        
        for new_product in new_products:
            brand_name = str(new_product.get('brand_name', '')).strip()
            generic_name = str(new_product.get('generic_name', '')).strip()
            
            if not brand_name:
                continue
            
            brand_lower = brand_name.lower()
            generic_lower = generic_name.lower()
            
            match = None
            
            # Tier 1: Match against (Brand, Composition) or (RC Brand, Composition)
            if generic_lower:
                match = lookup_full.get((brand_lower, generic_lower))
            
            # Tier 2: Match against Brand Name only or RC Name only
            if not match:
                match = lookup_name_only.get(brand_lower)
            
            if match:
                matched_products.append({
                    'product_id': match['product_id'],
                    'name': match['name'],
                    'composition': match['composition'],
                    'rc_pharam_product_name': match['rc_pharam_product_name'],
                    'inStock': bool(match['inStock']),
                    'matched_brand': brand_name,
                    'matched_generic': generic_name
                })
            else:
                unmatched_products.append({
                    'brand_name': brand_name,
                    'generic_name': generic_name
                })
        
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'Auto-detected {len(matched_products)} matches out of {len(new_products)}',
            'matched_count': len(matched_products),
            'unmatched_count': len(unmatched_products),
            'matched_products': matched_products
        }), 200
        
    except Exception as e:
        if 'connection' in locals() and connection:
            connection.close()
        return jsonify({'success': False, 'error': str(e)}), 500



if __name__ == '__main__':
    print("=" * 50)
    print("Product Management API Server")
    print("=" * 50)
    print(f"Database: {app.config['MYSQL_DB']}")
    print(f"Host: {app.config['MYSQL_HOST']}")
    print("Server starting on http://localhost:5000")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
