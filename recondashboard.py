#!/usr/bin/env python2.7
import sys
import urllib2
import glob
import random
import os
import subprocess
import threading
import json
from flask_misaka import Misaka
from flask import Flask, render_template, request, jsonify, escape

# Web Application Variables
app = Flask(__name__, static_url_path='', static_folder='web/static', template_folder='web/templates')
Misaka(app)

# Set Progress file to False
with open("files/finished/aquatone.txt", "w+") as progress_checker:
	progress_checker.write("false")

with open("files/finished/port-scanning.txt", "w+") as progress_checker:
	progress_checker.write("false")

with open("files/finished/ssl-scanning.txt", "w+") as progress_checker:
	progress_checker.write("false")

with open("files/api_keys.json", 'r') as api_keys:
	aquatone_key_types = [
	  	"shodan",
		"censys_id",
		"censys_secret",
		"passivetotal_key",
		"passivetotal_secret",
		"riddler_username",
		"riddler_password",
	  	"virustotal"
	]
	key_json = json.load(api_keys)
	with open("files/aquatone/.keys.yml", "w+") as aquatone_keys_file:
		aquatone_keys_file.write("---" + "\r\n")
		for key_type in aquatone_key_types:
			aquatone_keys_file.write(key_type + ": " + key_json[key_type] + "\r\n")

# Set Aquatone Environment Variable
os.environ["AQUATONEPATH"] = os.path.dirname(os.path.realpath(__file__)) + "/files/aquatone/"

# Aquatone Discover Module
def aquatoneDiscover(target):
	subprocess.call(['aquatone-discover', '-d', target])
	subprocess.call(['aquatone-scan', '-d', target])
	subprocess.call(['aquatone-takeover', '-d', target])
	with open("files/finished/aquatone.txt", "w+") as progress_checker:
		progress_checker.write("false")

# Nmap Scan
def nmapScan(command):
	cmd = command.split(" ")
	subprocess.call(cmd)
	with open("files/finished/port-scanning.txt", "w+") as progress_checker:
		progress_checker.write("false")

def sslScan(command, scan_filename):
	cmd = command.split(" ")
	output = subprocess.check_output(cmd)
	with open(os.path.dirname(os.path.realpath(__file__)) + "/files/sslscans/" + scan_filename, "w+") as scan_results:
		scan_results.write(output)
	with open("files/finished/ssl-scanning.txt", "w+") as progress_checker:
		progress_checker.write("false")



# HTTP Handlers
@app.route('/', methods = ['GET', 'POST'])
def index():
	if request.form.get('view') != None:
		return render_template('index.html', document=open("files/notes/" + escape(request.args.get('viewer')) + ".md").read(),)
	else:
		return render_template('index.html', notes=glob.glob("files/notes/*.md"), aquatone_folders=glob.glob("files/aquatone/*"), aquatone_files=glob.glob("files/aquatone/*/*"), nmap_files=glob.glob("files/nmap/*"), sslscans=glob.glob("files/sslscans/*"), template_files=glob.glob("files/report-templates/*.md"),)

@app.route('/api', methods = ['POST'])
def api():
	# View Scan results
	if request.form.get('scan_results') == "nmap":
		if request.form.get('folder') == "null":
			if request.form.get('file_name') != None:
				path = os.path.abspath("files/nmap/" + request.form.get('file_name'))
				if path.startswith(os.path.dirname(os.path.realpath(__file__)) + "/files/nmap/"):
					try:
						file_content = open(path).read()
						return jsonify({"contents":file_content})
					except:
						return jsonify("failure")
				else:
					return jsonify("failure")

	if request.form.get('scan_results') == "sslscans":
		if request.form.get('folder') == "null":
			if request.form.get('file_name') != None:
				path = os.path.abspath("files/sslscans/" + request.form.get('file_name'))
				if path.startswith(os.path.dirname(os.path.realpath(__file__)) + "/files/sslscans/"):
					try:
						file_content = open(path).read()
						return jsonify({"contents":file_content})
					except:
						return jsonify("failure")
				else:
					return jsonify("failure")
	elif request.form.get("scan_results") == "aquatone":
		if request.form.get('folder') != None:
			if request.form.get('file_name') != None:
				path = os.path.abspath("files/aquatone/" + request.form.get('folder') + "/" + request.form.get('file_name'))
				if path.startswith(os.path.dirname(os.path.realpath(__file__)) + "/files/aquatone/"):
					try:
						file_content = open(path).read()
						return jsonify({"contents":file_content})
					except:
						return jsonify("failure")
				else:
					return jsonify("failure")


	# Convert JSON Object into valid Host List & Then Nmap Scan
	elif request.form.get('target_name') != None:
		if request.form.get('target_json') != None:
			if request.form.get('scan_type') != None:
				try:
					with open("/tmp/hosts.txt", 'w+') as hosts_file:
						pass
					json_targets = request.form.get('target_json').strip()
					jsonObject = json.loads(json_targets)
					for key in jsonObject:
						with open("/tmp/hosts.txt", 'a+') as hosts_file:
							hosts_file.write("{}\n".format(key))

					if request.form.get('scan_type') == "PingScan":
						cmd = "nmap -sP -iL /tmp/hosts.txt -oN files/nmap/" + str(request.form.get('target_name')).strip()
					elif request.form.get('scan_type') == "VersionDetctionScan":
						cmd = "nmap -sV -iL /tmp/hosts.txt -oN files/nmap/" + str(request.form.get('target_name')).strip()
					elif request.form.get('scan_type') == "SYNStealthScan":
						cmd = "nmap -sS -iL /tmp/hosts.txt -oN files/nmap/" + str(request.form.get('target_name')).strip()
					elif request.form.get('scan_type') == "TCPConnectScan":
						cmd = "nmap -sT -iL /tmp/hosts.txt -oN files/nmap/" + str(request.form.get('target_name')).strip()
					elif request.form.get('scan_type') == "SSLScan":
						cmd = "sslscan --no-colour --targets=/tmp/hosts.txt"

					if request.form.get('scan_type') == "SSLScan":
						with open("files/finished/ssl-scanning.txt", "w+") as progress_checker:
							progress_checker.write("true")
						t = threading.Thread(target=sslScan, args=(str(cmd),str(request.form.get('target_name')).strip(),))
						t.start()
						return jsonify("scanning")
					else:
						with open("files/finished/port-scanning.txt", "w+") as progress_checker:
							progress_checker.write("true")
						t = threading.Thread(target=nmapScan, args=(str(cmd),))
						t.start()
						return jsonify("scanning")

				except Exception, e:
					return jsonify("failure " + str(e))

	# Nmap Progress Checker
	elif request.form.get('nmap_progress') == "view":
		try:
			return jsonify(open("files/finished/port-scanning.txt").read())
		except:
			return jsonify("failure")

	elif request.form.get('sslscan_progress') == "view":
		try:
			return jsonify(open("files/finished/ssl-scanning.txt").read())
		except:
			return jsonify("failure")

	# Aquatone Discover
	elif request.form.get('aquatone-discover') != None:
		try:
			with open("files/finished/aquatone.txt", "w+") as progress_checker:
				progress_checker.write("true")
			t = threading.Thread(target=aquatoneDiscover, args=(str(request.form.get('aquatone-discover')),))
			t.start()
			return jsonify("scanning")
		except Exception, e:
			return jsonify("failure")

	# Check if Aquatone is scanning
	elif request.form.get('aquatone-progress') != None:
		try:
			with open("files/finished/aquatone.txt", "r") as progress_check:
				return jsonify(escape(progress_check.read()))
		except Exception, e:
			return jsonify("failure")

	# Aquatone Progress Checker
	elif request.form.get('aquatone_progress') == "view":
		try:
			return jsonify(open("files/finished/aquatone.txt").read())
		except:
			return jsonify("failure")
	# Get Note Contents
	elif request.form.get('note') != None:
		try:
			return jsonify({"file_name":request.form.get('note'),"content": escape(open(str("files/notes/" + request.form.get('note')) + ".md", 'r').read())})
		except Exception, e:
			return jsonify(str(e))

	# Get Report Template Contents
	elif request.form.get('view_template') == "true":
		try:
			return jsonify({"file_name":request.form.get('report_name'), "content": open(str("files/report-templates/" + request.form.get('report_name') + ".md"), 'r').read()});
		except Exception, e:
			if "No such file or directory:" in str(e):
				return jsonify("failure")

	# Create New Note
	elif request.form.get('newNote') != None:
		try:
			with open("files/notes/" + request.form.get('newNote') + ".md", "w+") as Note:
				return jsonify("success")
		except:
			return jsonify("failure")

	# Save Note
	elif request.form.get('saveNote') != None:
		if request.form.get('noteBody') != None:
			with open("files/notes/" + request.form.get('saveNote') + ".md", "w+") as Note:
				Note.write(request.form.get('noteBody'))
				return jsonify("success")
		else:
			return jsonify("failure")

	# Delete Note
	elif request.form.get('deleteNote') != None:
		try:
			os.remove("files/notes/" + request.form.get('deleteNote') + ".md")
			return jsonify("success")
		except Exception, e:
			return jsonify("failure")
	else:
		return jsonify("Nothing was queried.")



if __name__ == '__main__':
    try:
    	app.run(host= '127.0.0.1', port=5000, debug=True)
    except Exception, e:
		print str(e)
